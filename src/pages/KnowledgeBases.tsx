/**
 * KnowledgeBases — main knowledge management page (refactored).
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────┐
 *   │ ┌────────┐ ┌─────────────────────────────────────────┐ │
 *   │ │ Group  │ │ Header: "知识库" + "创建知识库"          │ │
 *   │ │ Tree   │ │                                         │ │
 *   │ │(240px) │ │ KB Cards grid (filtered by group)       │ │
 *   │ │        │ │                                         │ │
 *   │ │        │ │ Document panel (when KB selected)       │ │
 *   │ │        │ │ Query panel (toggle)                    │ │
 *   │ └────────┘ └─────────────────────────────────────────┘ │
 *   └─────────────────────────────────────────────────────────┘
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Button, Typography, Row, Col, App } from 'antd';
import { PlusOutlined, BookOutlined, MenuOutlined } from '@ant-design/icons';
import { useApiListQuery, useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks';
import type { KnowledgeBase, KnowledgeGroup } from '@/types';
import { EmptyState, TableSkeleton } from '@/components';
import { radius } from '@/styles/themeTokens';
import GroupTree from '@/components/knowledge/GroupTree';
import KBCard from '@/components/knowledge/KBCard';
import DocumentList from '@/components/knowledge/DocumentList';
import QueryPanel from '@/components/knowledge/QueryPanel';
import CreateKBModal from '@/components/knowledge/CreateKBModal';
import EditKBModal from '@/components/knowledge/EditKBModal';

const { Title, Text } = Typography;

/** Virtual key used by GroupTree for the "未分组" node. */
const UNGROUPED_KEY = 'ungrouped';

const KnowledgeBases: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
  const [showQuery, setShowQuery] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingKb, setEditingKb] = useState<KnowledgeBase | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { message, modal } = App.useApp();

  // Fetch groups for the tree (used by CreateKBModal's group Select too)
  const { data: groups = [] } = useApiQuery<KnowledgeGroup[]>({
    queryKey: ['knowledge-groups'],
    endpoint: '/knowledge-groups/list',
  });

  // Fetch KBs — pass group_id when a real group is selected
  const queryParams = useMemo(() => {
    if (!selectedGroupId || selectedGroupId === UNGROUPED_KEY) return undefined;
    return { group_id: selectedGroupId };
  }, [selectedGroupId]);

  const {
    data: kbData,
    isLoading,
    refetch: refetchKbs,
  } = useApiListQuery<KnowledgeBase>({
    queryKey: ['knowledge-bases', selectedGroupId ?? 'all'],
    endpoint: '/knowledge-bases/list',
    params: queryParams,
  });

  // Client-side filter for "未分组" (group_id is null)
  const kbs = useMemo(() => {
    const items = kbData?.items ?? [];
    if (selectedGroupId === UNGROUPED_KEY) {
      return items.filter((kb) => !kb.group_id);
    }
    return items;
  }, [kbData, selectedGroupId]);

  const handleSelectKb = (kb: KnowledgeBase) => {
    if (selectedKb?.id === kb.id) {
      setSelectedKb(null);
      setShowQuery(false);
    } else {
      setSelectedKb(kb);
      setShowQuery(false);
    }
  };

  const handleEditKb = (kb: KnowledgeBase) => {
    setEditingKb(kb);
    setEditOpen(true);
  };

  const deleteMutation = useApiMutation<void, { id: string }>({
    endpoint: '/knowledge-bases/delete',
    invalidateKeys: [['knowledge-bases']],
  });

  const handleDeleteKb = useCallback(
    (kb: KnowledgeBase) => {
      modal.confirm({
        title: `删除知识库 "${kb.name}"？`,
        content: '删除后所有文档和向量数据将无法恢复。',
        okText: '删除',
        okButtonProps: { danger: true },
        cancelText: '取消',
        onOk: async () => {
          deleteMutation.mutate({ id: kb.id }, {
            onSuccess: () => {
              message.success('知识库已删除');
              if (selectedKb?.id === kb.id) {
                setSelectedKb(null);
                setShowQuery(false);
              }
            },
          });
        },
      });
    },
    [modal, message, selectedKb, deleteMutation],
  );

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {/* ─── Left: Group tree (hidden on small screens) ─────────── */}
      <div
        style={{
          display: sidebarOpen ? 'block' : 'none',
          flexShrink: 0,
        }}
        className="knowledge-sidebar"
      >
        <GroupTree selectedGroupId={selectedGroupId} onSelect={setSelectedGroupId} />
      </div>

      {/* ─── Right: Main content ────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div
          className="animate-fade-in-up"
          style={{
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile toggle */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="切换侧栏"
              className="knowledge-sidebar-toggle"
              style={{ display: 'none' }}
            />
            <div>
              <Title
                level={2}
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 34,
                  letterSpacing: '-0.04em',
                  color: 'var(--text-primary)',
                }}
              >
                知识库
              </Title>
              <Text
                style={{
                  fontSize: 17,
                  color: 'var(--text-secondary)',
                  marginTop: 6,
                  display: 'block',
                }}
              >
                管理文档与向量索引
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{ height: 44, paddingInline: 20, borderRadius: radius.md, fontWeight: 500 }}
          >
            创建知识库
          </Button>
        </div>

        {/* KB Cards grid */}
        {isLoading ? (
          <TableSkeleton />
        ) : kbs.length === 0 ? (
          <EmptyState
            icon={<BookOutlined />}
            title={
              selectedGroupId === UNGROUPED_KEY
                ? '没有未分组的知识库'
                : selectedGroupId
                  ? '该分组暂无知识库'
                  : '还没有知识库'
            }
            description="创建知识库后，可上传文档用于 RAG 检索"
            actionText="创建第一个知识库"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {kbs.map((kb) => (
              <Col key={kb.id} xs={24} sm={12} lg={8} xl={6}>
                <KBCard
                  kb={kb}
                  onClick={handleSelectKb}
                  selected={selectedKb?.id === kb.id}
                  onEdit={handleEditKb}
                  onDelete={handleDeleteKb}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* Document panel — appears when a KB is selected */}
        {selectedKb && (
          <DocumentList
            key={selectedKb.id}
            kbId={selectedKb.id}
            kbName={selectedKb.name}
            onQueryClick={() => setShowQuery((v) => !v)}
            onChange={() => {
              refetchKbs();
            }}
          />
        )}

        {/* Query panel — appears when "查询测试" is clicked */}
        {showQuery && selectedKb && (
          <QueryPanel
            key={`query-${selectedKb.id}`}
            kbId={selectedKb.id}
            kbName={selectedKb.name}
            onClose={() => setShowQuery(false)}
          />
        )}
      </div>

      {/* Create KB modal */}
      <CreateKBModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        groups={groups}
        defaultGroupId={selectedGroupId}
      />

      {/* Edit KB modal */}
      <EditKBModal
        open={editOpen}
        kb={editingKb}
        groups={groups}
        onCancel={() => {
          setEditOpen(false);
          setEditingKb(null);
        }}
        onUpdated={() => {
          refetchKbs();
          if (editingKb && selectedKb?.id === editingKb.id) {
            // Refresh selected KB data
            refetchKbs();
          }
        }}
      />

      {/* Responsive CSS — hide sidebar on small screens, show toggle */}
      <style>{`
        @media (max-width: 768px) {
          .knowledge-sidebar {
            display: none !important;
          }
          .knowledge-sidebar-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default KnowledgeBases;
