import { NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { ActionIcon, CopyButton, Group, Select, Tooltip } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
//import MermaidView from "@/features/editor/components/code-block/mermaid-view";
import classes from './code-block.module.css';
import React from 'react';
import { Suspense } from 'react';

const MermaidView = React.lazy(
    () => import('@/features/editor/components/code-block/mermaid-view')
);

export default function CodeBlockView(props: NodeViewProps) {
    const { node, updateAttributes, extension, editor, getPos } = props;
    const { language } = node.attrs;
    const [languageValue, setLanguageValue] = useState<string | null>(
        language || null
    );
    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
        const updateSelection = () => {
            const { state } = editor;
            const { from, to } = state.selection;
            // Check if the selection intersects with the node's range
            const isNodeSelected =
                (from >= getPos() && from < getPos() + node.nodeSize) ||
                (to > getPos() && to <= getPos() + node.nodeSize);
            setIsSelected(isNodeSelected);
        };

        editor.on('selectionUpdate', updateSelection);
        return () => {
            editor.off('selectionUpdate', updateSelection);
        };
    }, [editor, getPos(), node.nodeSize]);

    function changeLanguage(language: string | null) {
        setLanguageValue(language);
        updateAttributes({
            language: language,
        });
    }

    return (
        <NodeViewWrapper className="codeBlock">
            <Group justify="flex-end" contentEditable={false}>
                <Select
                    placeholder="auto"
                    checkIconPosition="right"
                    data={extension.options.lowlight.listLanguages().sort()}
                    value={languageValue}
                    onChange={changeLanguage}
                    searchable
                    style={{ maxWidth: '130px' }}
                    classNames={{ input: classes.selectInput }}
                    disabled={!editor.isEditable}
                />

                <CopyButton value={node?.textContent} timeout={2000}>
                    {({ copied, copy }) => (
                        <Tooltip
                            label={copied ? 'Copied' : 'Copy'}
                            withArrow
                            position="right"
                        >
                            <ActionIcon
                                color={copied ? 'teal' : 'gray'}
                                variant="subtle"
                                onClick={copy}
                            >
                                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                        </Tooltip>
                    )}
                </CopyButton>
            </Group>

            <pre
                spellCheck="false"
                hidden={
                    ((language === 'mermaid' && !editor.isEditable) ||
                        (language === 'mermaid' && !isSelected)) &&
                    node.textContent.length > 0
                }
            >
                <NodeViewContent as="code" className={`language-${language}`} />
            </pre>

            {language === 'mermaid' && (
                <Suspense fallback={null}>
                    <MermaidView props={props} />
                </Suspense>
            )}
        </NodeViewWrapper>
    );
}
