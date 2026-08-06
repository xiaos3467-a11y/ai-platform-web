/**
 * GroupTree — left sidebar tree of knowledge groups.
 *
 * Layout (top to bottom):
 *   Header: "分组" title + "新建分组" button
 *   Tree:   "全部知识库" (virtual) → nested groups → "未分组" (virtual)
 *
 * The component fetches `/knowledge-groups` on mount via useApiQuery,
 * builds an antd TreeData array from the nested response, and calls
 * `onSelect(key)` when the user clicks a node.
 *
 * Keys:
 *   "all"        → virtual "全部知识库" — no filter applied
 *   "ungrouped"  → virtual "未分组"     — filters KBs where group_id is null
 *   <group.id>   → real group           — filters KBs by group_id
 */

import React, { useMemo, useState } from 'react';
import { Tree, Button, App, Typography } from 'antd';
import type { TreeDataNode } from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  GlobalOutlined,
  InboxOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useApiQuery, useApiMutation } from '@/hooks';
import type { KnowledgeGroup } from '@/types';
import { radius } from '@/styles/themeTokens';
import CreateGroupModal from './CreateGroupModal';

import { GlassCard } from '@/components';

const { Text } = Typography;

export interface GroupTreeProps {
  selectedGroupId: string | null;
  onSelect: (groupId: string | null) => void;
}

/** Special virtual keys. */
const ALL_KEY = 'all';
const UNGROUPED_KEY = 'ungrouped';
const EMPTY_GROUPS: KnowledgeGroup[] = [];

/** Recursively convert KnowledgeGroup[] into antd TreeDataNode[]. */
function toTreeData(groups: KnowledgeGroup[]): TreeDataNode[] {
  return groups.map((g) => ({
    key: g.id,
    title: g.name,
    icon: <FolderOutlined />,
    kbCount: g.kb_count,
    children: g.children?.length ? toTreeData(g.children) : undefined,
  }));
}

const GroupTree: React.FC<GroupTreeProps> = ({ selectedGroupId, onSelect }) => {
  const { message, modal } = App.useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // Fetch the group tree
  const { data, refetch } = useApiQuery<KnowledgeGroup[]>({
    queryKey: ['knowledge-groups'],
    endpoint: '/knowledge-groups/',
  });

  const groups = data ?? EMPTY_GROUPS;

  // Build the antd tree data with virtual root / ungrouped nodes
  const treeData = useMemo<TreeDataNode[]>(() => {
    const allNode: TreeDataNode = {
      key: ALL_KEY,
      title: '全部知识库',
      icon: <GlobalOutlined />,
      isLeaf: true,
    };
    const ungroupedNode: TreeDataNode = {
      key: UNGROUPED_KEY,
      title: '未分组',
      icon: <InboxOutlined />,
      isLeaf: true,
    };
    return [allNode, ...toTreeData(groups), ungroupedNode];
  }, [groups]);

  // Delete mutation
  const deleteMutation = useApiMutation<unknown, string>({
    method: 'delete',
    endpoint: (id) => `/knowledge-groups/${id}`,
    invalidateKeys: [['knowledge-groups']],
  });

  const handleDelete = (id: string, name: string) => {
    modal.confirm({
      title: `删除分组 "${name}"？`,
      content: '分组内的知识库不会被删除，仅解除分组关系。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        deleteMutation.mutate(id, {
          onSuccess: () => {
            message.success('分组已删除');
            if (selectedGroupId === id) onSelect(null);
          },
        });
      },
    });
  };

  // Hover action renderer — used as the tree title
  const renderTitle = (node: TreeDataNode) => {
    const isVirtual = node.key === ALL_KEY || node.key === UNGROUPED_KEY;
    const kbCount = (node as TreeDataNode & { kbCount?: number }).kbCount;
    return (
      <div
        className="group-tree-node"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingRight: 4,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            {node.title as React.ReactNode}
          </span>
          {kbCount !== undefined && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-subtle)',
                padding: '0 5px',
                borderRadius: radius.full,
                background: 'var(--bg-elevated)',
                lineHeight: '18px',
              }}
            >
              {kbCount}
            </span>
          )}
        </span>
        {!isVirtual && (
          <span
            className="group-tree-actions"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 2,
              marginLeft: 4,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              aria-label="删除分组"
              danger
              style={{ width: 22, height: 22, minWidth: 22 }}
              onClick={() =>
                handleDelete(node.key as string, node.title as React.ReactNode as string)
              }
            />
          </span>
        )}
      </div>
    );
  };

  // Map renderTitle into the tree data
  const decoratedData = useMemo<TreeDataNode[]>(() => {
    const walk = (nodes: TreeDataNode[]): TreeDataNode[] =>
      nodes.map((n) => ({
        ...n,
        title: renderTitle(n),
        children: n.children ? walk(n.children as TreeDataNode[]) : undefined,
      }));
    return walk(treeData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData]);

  const selectedKeys = selectedGroupId === null ? [ALL_KEY] : [selectedGroupId];

  return (
    <>
      <GlassCard
        style={{
          width: 240,
          flexShrink: 0,
          height: 'fit-content',
          position: 'sticky',
          top: 16,
        }}
        styles={{ body: { padding: '16px 8px' } }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px 12px',
            borderBottom: '0.5px solid var(--border-divider)',
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            分组
          </Text>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            aria-label="新建分组"
            onClick={() => setCreateOpen(true)}
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>

        {/* Tree */}
        <Tree
          showIcon
          blockNode
          treeData={decoratedData}
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys)}
          onSelect={(keys) => {
            const key = keys[0] as string | undefined;
            if (!key || key === ALL_KEY) onSelect(null);
            else onSelect(key);
          }}
          switcherIcon={<FolderOpenOutlined style={{ color: 'var(--text-subtle)' }} />}
          style={{ background: 'transparent', fontSize: 13 }}
        />
      </GlassCard>

      <CreateGroupModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        groups={groups}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Scoped CSS: show action buttons on hover */}
      <style>{`
        .group-tree-node:hover .group-tree-actions {
          display: inline-flex !important;
        }
      `}</style>
    </>
  );
};

export default GroupTree;
