# 知识库模块重设计方案

> 状态：待审批 | 作者：架构师 | 日期：2026-08-06

---

## 一、现状分析

### 已有能力

| 层         | 现状                                                            |
| ---------- | --------------------------------------------------------------- |
| **模型**   | KnowledgeBase → Document → DocumentChunk 三级结构已建立         |
| **API**    | CRUD + 文档上传 + RAG 查询（`/api/v1/knowledge-bases`）7 个端点 |
| **RAG**    | 解析 → 分块 → 向量化 → Milvus 存储 → 余弦检索 → 可选 LLM 生成   |
| **解析器** | TXT/MD/PDF/HTML/DOCX（5 种格式）                                |
| **向量库** | Milvus (IVF_FLAT + COSINE)，1536 维                             |
| **前端**   | 仅列表页 + 内嵌文档面板，无详情页、无查询 UI                    |

### 关键缺口

1. ❌ **无分组能力** — 知识库只能平铺，无法按业务/项目组织
2. ❌ **格式有限** — 缺 Excel、CSV、PPT、图片(OCR)、音频转写
3. ❌ **文件不持久化** — `storage_path` 未写入，无法重建索引
4. ❌ **上传同步阻塞** — 大文件卡在 HTTP 请求中
5. ❌ **前端无查询** — 后端 `/query` 完整但前端未接入
6. ❌ **删除不清理 Milvus** — 向量库残留脏数据
7. ❌ **Embedding 不可配** — 前端硬编码模型
8. ❌ **无 Rerank** — 纯向量排序，精度受限

---

## 二、目标设计

### 2.1 领域模型（新增 + 修改）

```
Tenant (已有)
  ├── KnowledgeGroup (新增) — 知识库分组
  │     ├── id, tenant_id, name, description, icon, sort_order, parent_id(自引用)
  │     └── → KnowledgeBase[] (一对多)
  │
  └── KnowledgeBase (修改)
        ├── ... (原有字段保留)
        ├── group_id (新增 FK → knowledge_groups)  ← 分组归属
        ├── embedding_model (已有，前端暴露可选)
        └── chunk_config (已有，前端暴露可配)

Document (修改)
  ├── ... (原有字段保留)
  ├── storage_path (已有字段，修复写入逻辑)  ← 持久化原始文件
  ├── file_hash (新增) — SHA256，去重 + 变更检测
  ├── parse_result_path (新增) — 解析后的 markdown 缓存路径
  └── processing_progress (新增 JSON) — `{stage, percent, message}`

DocumentChunk (不变)
```

### 2.2 新增实体：KnowledgeGroup

```sql
CREATE TABLE knowledge_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  parent_id UUID REFERENCES knowledge_groups(id),  -- 支持二级分组
  name VARCHAR(128) NOT NULL,
  description TEXT,
  icon VARCHAR(64),  -- antd icon name
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- KB 表新增 group_id
ALTER TABLE knowledge_bases ADD COLUMN group_id UUID REFERENCES knowledge_groups(id);
```

### 2.3 文件解析扩展

新增解析器（`core/knowledge/parsers/`）：

| 格式       | MIME                                                                        | 解析策略                                  | 依赖                     |
| ---------- | --------------------------------------------------------------------------- | ----------------------------------------- | ------------------------ |
| **Excel**  | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`         | 每 sheet → markdown 表格，大表按行分块    | `openpyxl`               |
| **CSV**    | `text/csv`                                                                  | 直接 → markdown 表格                      | 内置 `csv`               |
| **PPT**    | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | 每 slide → 标题+正文段落                  | `python-pptx`            |
| **图片**   | `image/png`, `image/jpeg`                                                   | OCR → 文本（调用多模态 LLM 或 Tesseract） | `pytesseract` 或 LLM API |
| **纯文本** | 已有                                                                        | —                                         | —                        |
| **PDF**    | 已有                                                                        | —                                         | —                        |
| **HTML**   | 已有                                                                        | —                                         | —                        |
| **DOCX**   | 已有                                                                        | —                                         | —                        |

**图片 OCR 策略**（优先级）：

1. 调用已配置的 LLM 多模态接口（`gpt-4o` vision）— 精度最高
2. Fallback 到本地 Tesseract（`pytesseract`）

### 2.4 异步上传 + 进度追踪

```
前端 POST /documents (multipart)
  → 后端立即返回 {document_id, status: "pending"}
  → 后台任务（asyncio.create_task 或 Celery）执行：
      parse → chunk → embed → milvus_insert
  → 前端轮询 GET /documents/{id} 查看 processing_progress
  → 完成后 WebSocket / SSE 推送状态变更（可选）
```

简化方案（Phase 1）：`asyncio.create_task` + 轮询，不引入 Celery。

### 2.5 Rerank（可选增强）

在向量检索后增加 rerank 步骤：

- 使用 Cohere Rerank API 或 `bge-reranker` 本地模型
- 先 top_k=50 粗排，rerank 后取 top_k=5 精排
- 配置项 `rerank_model` 加到 KnowledgeBase

### 2.6 文件持久化修复

```python
# 当前：文件读入内存即丢弃
# 修复：写入 storage/ 目录，记录 storage_path
storage_dir = settings.storage_path / "documents" / str(kb.tenant_id)
storage_path = storage_dir / f"{document_id}_{filename}"
storage_path.parent.mkdir(parents=True, exist_ok=True)
storage_path.write_bytes(file_bytes)
document.storage_path = str(storage_path)
```

---

## 三、API 设计

### 3.1 新增：分组管理

| 方法     | 路径                            | 权限                    | 说明                         |
| -------- | ------------------------------- | ----------------------- | ---------------------------- |
| `POST`   | `/api/v1/knowledge-groups`      | `knowledge_base.create` | 创建分组                     |
| `GET`    | `/api/v1/knowledge-groups`      | `knowledge_base.read`   | 列表（树形，含子分组）       |
| `PUT`    | `/api/v1/knowledge-groups/{id}` | `knowledge_base.update` | 更新                         |
| `DELETE` | `/api/v1/knowledge-groups/{id}` | `knowledge_base.delete` | 删除（级联 KB 移到"未分组"） |

### 3.2 修改：知识库 CRUD

| 变更                            | 说明                                   |
| ------------------------------- | -------------------------------------- |
| `POST /knowledge-bases` body    | 新增 `group_id` 可选字段               |
| `GET /knowledge-bases` 查询参数 | 新增 `group_id` 过滤                   |
| `POST /knowledge-bases` body    | `embedding_model` 改为可选（取默认值） |
| `DELETE /knowledge-bases/{id}`  | 修复：同时删除 Milvus collection       |

### 3.3 修改：文档上传

| 变更                                     | 说明                                     |
| ---------------------------------------- | ---------------------------------------- |
| `POST /{kb_id}/documents`                | 改为异步：立即返回 document_id，后台处理 |
| `GET /{kb_id}/documents/{doc_id}`        | 新增：文档详情 + processing_progress     |
| `POST /{kb_id}/documents/{doc_id}/retry` | 新增：失败文档重试                       |
| `DELETE /{kb_id}/documents/{doc_id}`     | 新增：删除单个文档（含 Milvus 清理）     |

### 3.4 新增：知识库查询（前端消费已有接口）

| 方法   | 路径             | 说明           |
| ------ | ---------------- | -------------- |
| `POST` | `/{kb_id}/query` | 已有，前端接入 |

---

## 四、前端设计

### 4.1 页面结构

```
/knowledge                          → KnowledgeBases.tsx（主页面，重构）
  ├── 左侧：分组树（KnowledgeGroupTree）
  │     ├── 全部知识库
  │     ├── 📁 产品文档
  │     ├── 📁 技术支持
  │     │    ├── 📁 FAQ
  │     │    └── 📁 故障排查
  │     └── 📁 未分组
  │
  └── 右侧：知识库列表（按选中分组过滤）
        ├── 知识库卡片（名称 / 文档数 / 分块数 / 状态）
        └── 点击卡片 → 展开详情面板
              ├── 文档列表（带状态、进度）
              ├── 上传区（拖拽，多格式）
              └── 💬 查询测试面板（RAG 问答）
```

### 4.2 组件拆分

| 组件                     | 文件                                         | 职责                           |
| ------------------------ | -------------------------------------------- | ------------------------------ |
| `KnowledgeBases.tsx`     | `pages/knowledge/KnowledgeBases.tsx`         | 主容器，左树 + 右列表          |
| `KnowledgeGroupTree.tsx` | `components/knowledge/GroupTree.tsx`         | 分组树（antd Tree + 拖拽排序） |
| `KnowledgeCard.tsx`      | `components/knowledge/KBCard.tsx`            | 知识库卡片                     |
| `DocumentList.tsx`       | `components/knowledge/DocumentList.tsx`      | 文档列表 + 上传 + 进度         |
| `QueryPanel.tsx`         | `components/knowledge/QueryPanel.tsx`        | RAG 查询测试（对话框式）       |
| `CreateKBModal.tsx`      | `components/knowledge/CreateKBModal.tsx`     | 创建 KB（暴露模型/chunk 配置） |
| `ManageGroupsModal.tsx`  | `components/knowledge/ManageGroupsModal.tsx` | 分组管理                       |

### 4.3 交互设计

- 拖拽上传：支持批量，显示文件格式图标 + 进度条
- 处理中：文档行显示 spinner + 百分比
- 查询面板：类 ChatGPT 对话式，显示检索到的 chunks（折叠）+ 生成答案
- 分组拖拽排序

---

## 五、数据库变更

### Phase 1（立即实施）

```sql
-- 1. 新建分组表
CREATE TABLE knowledge_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  parent_id UUID REFERENCES knowledge_groups(id),
  name VARCHAR(128) NOT NULL,
  description TEXT,
  icon VARCHAR(64),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- 2. KB 关联分组
ALTER TABLE knowledge_bases ADD COLUMN group_id UUID REFERENCES knowledge_groups(id);
CREATE INDEX idx_kb_group ON knowledge_bases(group_id);

-- 3. Document 新增字段
ALTER TABLE documents ADD COLUMN file_hash VARCHAR(64);
ALTER TABLE documents ADD COLUMN parse_result_path TEXT;
ALTER TABLE documents ADD COLUMN processing_progress JSONB DEFAULT '{}';
```

### Phase 2（后续）

- Rerank 配置字段
- KB 级权限表（可选）

---

## 六、实施计划

### Phase 1：核心改造（前后端并行，预计 2-3 天）

| #    | 任务                                       | 前端/后端 | 依赖           | 可并行             |
| ---- | ------------------------------------------ | --------- | -------------- | ------------------ |
| KB-1 | 后端：分组 CRUD API                        | 后端      | 无             | ✅                 |
| KB-2 | 后端：KB API 增加 group_id 支持            | 后端      | KB-1           | —                  |
| KB-3 | 后端：新增 Excel/CSV/PPT/图片 解析器       | 后端      | 无             | ✅（与 KB-1 并行） |
| KB-4 | 后端：文档上传改异步 + 进度追踪            | 后端      | 无             | ✅（与 KB-1 并行） |
| KB-5 | 后端：修复 storage_path 写入 + Milvus 清理 | 后端      | 无             | ✅（与 KB-1 并行） |
| KB-6 | 前端：分组树 + 知识库列表重构              | 前端      | KB-2           | —                  |
| KB-7 | 前端：文档上传（拖拽 + 进度）              | 前端      | KB-4           | —                  |
| KB-8 | 前端：查询面板（RAG 问答）                 | 前端      | 无（接口已有） | ✅                 |
| KB-9 | 前端：创建 KB 增强（模型/chunk 配置）      | 前端      | KB-2           | —                  |

### 可并行的组合

```
第一批（并行）：
  - KB-1 (分组 API)      + KB-3 (新解析器)  + KB-4 (异步上传)  + KB-8 (查询面板)

第二批（依赖第一批）：
  - KB-2 (KB API 改造)   + KB-5 (持久化修复)

第三批（依赖第二批）：
  - KB-6 (分组树 UI)     + KB-7 (上传 UI)   + KB-9 (创建增强)
```

### Phase 2：增强（后续迭代）

- Rerank 集成
- KB 级权限控制
- 文档版本管理
- 全文检索（PostgreSQL tsvector）

---

## 七、技术决策摘要

| 决策项      | 选择                                | 理由                              |
| ----------- | ----------------------------------- | --------------------------------- |
| 文件存储    | 本地磁盘（`storage/documents/`）    | 当前阶段简单可靠，后续可切 S3/OSS |
| 异步处理    | `asyncio.create_task`               | 不引入 Celery 复杂度，单机够用    |
| 图片 OCR    | LLM Vision 优先，Tesseract fallback | 精度 > 成本                       |
| 向量库      | 保持 Milvus                         | 已有集成，无迁移必要              |
| Embedding   | LiteLLM 统一接口                    | 保持灵活性                        |
| 分组层级    | 二级（parent_id 自引用）            | 够用，不过度设计                  |
| 前端分组 UI | antd Tree + 拖拽                    | 与现有 antd 生态一致              |
