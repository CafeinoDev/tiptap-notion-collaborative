import {
    BubbleMenu,
    BubbleMenuProps,
    isNodeSelection,
    useEditor,
} from "@tiptap/react";
import { FC, useState } from "react";
import {
    IconBold,
    IconCode,
    IconItalic,
    IconStrikethrough,
    IconUnderline,
} from "@tabler/icons-react";
import clsx from "clsx";
import classes from "./bubble-menu.module.css";
import { ActionIcon, rem, Tooltip } from "@mantine/core";
import { ColorSelector } from "./color-selector";
import { NodeSelector } from "./node-selector";
import { isCellSelection, isTextSelected } from "@/features/editor/extensions/lib";
import { LinkSelector } from "@/features/editor/components/bubble-menu/link-selector";

export interface BubbleMenuItem {
    name: string;
    isActive: () => boolean;
    command: () => void;
    icon: typeof IconBold;
}

type EditorBubbleMenuProps = Omit<BubbleMenuProps, "children" | "editor"> & {
    editor: ReturnType<typeof useEditor>;
};

export const EditorBubbleMenu: FC<EditorBubbleMenuProps> = (props) => {

    const items: BubbleMenuItem[] = [
        {
            name: "bold",
            isActive: () => !!props.editor && props.editor.isActive("bold"),
            command: () => !!props.editor && props.editor.chain().focus().toggleBold().run(),
            icon: IconBold,
        },
        {
            name: "italic",
            isActive: () => !!props.editor && props.editor.isActive("italic"),
            command: () => !!props.editor && props.editor.chain().focus().toggleItalic().run(),
            icon: IconItalic,
        },
        {
            name: "underline",
            isActive: () => !!props.editor && props.editor.isActive("underline"),
            command: () => !!props.editor && props.editor.chain().focus().toggleUnderline().run(),
            icon: IconUnderline,
        },
        {
            name: "strike",
            isActive: () => !!props.editor && props.editor.isActive("strike"),
            command: () => !!props.editor && props.editor.chain().focus().toggleStrike().run(),
            icon: IconStrikethrough,
        },
        {
            name: "code",
            isActive: () => !!props.editor && props.editor.isActive("code"),
            command: () => !!props.editor && props.editor.chain().focus().toggleCode().run(),
            icon: IconCode,
        },
    ];

    const bubbleMenuProps: EditorBubbleMenuProps = {
        ...props,
        shouldShow: ({ state, editor }) => {
            const { selection } = state;
            const { empty } = selection;

            if (
                !editor.isEditable ||
                editor.isActive("image") ||
                empty ||
                isNodeSelection(selection) ||
                isCellSelection(selection)
            ) {
                return false;
            }
            return isTextSelected(editor);
        },
        tippyOptions: {
            moveTransition: "transform 0.15s ease-out",
            onHide: () => {
                setIsNodeSelectorOpen(false);
                setIsColorSelectorOpen(false);
                setIsLinkSelectorOpen(false);
            },
        },
    };

    const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
    const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);
    const [isLinkSelectorOpen, setIsLinkSelectorOpen] = useState(false);

    return (
        <BubbleMenu {...bubbleMenuProps}>
            <div className={classes.bubbleMenu}>
                <NodeSelector
                    editor={props.editor}
                    isOpen={isNodeSelectorOpen}
                    setIsOpen={() => {
                        setIsNodeSelectorOpen(!isNodeSelectorOpen);
                    }}
                />

                <ActionIcon.Group>
                    {items.map((item, index) => (
                        <Tooltip key={index} label={item.name} withArrow>
                            <ActionIcon
                                key={index}
                                variant="default"
                                size="lg"
                                radius="0"
                                aria-label={item.name}
                                className={clsx({ [classes.active]: item.isActive() })}
                                style={{ border: "none" }}
                                onClick={item.command}
                            >
                                <item.icon style={{ width: rem(16) }} stroke={2} />
                            </ActionIcon>
                        </Tooltip>
                    ))}
                </ActionIcon.Group>

                <LinkSelector
                    editor={props.editor}
                    isOpen={isLinkSelectorOpen}
                    setIsOpen={() => {
                        setIsLinkSelectorOpen(!isLinkSelectorOpen);
                    }}
                />

                <ColorSelector
                    editor={props.editor}
                    isOpen={isColorSelectorOpen}
                    setIsOpen={() => {
                        setIsColorSelectorOpen(!isColorSelectorOpen);
                    }}
                />
            </div>
        </BubbleMenu>
    );
};
