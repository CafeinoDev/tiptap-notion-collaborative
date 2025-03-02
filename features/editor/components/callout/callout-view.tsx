import { NodeViewContent, NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import {
    IconAlertTriangleFilled,
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconInfoCircleFilled,
} from "@tabler/icons-react";
import { Alert } from "@mantine/core";
import classes from "./callout.module.css";
import { CalloutType } from "@/features/editor/extensions/lib";

export default function CalloutView(props: NodeViewProps) {
    const { node } = props;
    const { type } = node.attrs;

    return (
        <NodeViewWrapper>
            <Alert
                variant="light"
                title=""
                color={getCalloutColor(type)}
                icon={getCalloutIcon(type)}
                p="xs"
                classNames={{
                    message: classes.message,
                    icon: classes.icon,
                }}
            >
                <NodeViewContent />
            </Alert>
        </NodeViewWrapper>
    );
}

function getCalloutIcon(type: CalloutType) {
    switch (type) {
        case "info":
            return <IconInfoCircleFilled />;
        case "success":
            return <IconCircleCheckFilled />;
        case "warning":
            return <IconAlertTriangleFilled />;
        case "danger":
            return <IconCircleXFilled />;
        default:
            return <IconInfoCircleFilled />;
    }
}

function getCalloutColor(type: CalloutType) {
    switch (type) {
        case "info":
            return "blue";
        case "success":
            return "green";
        case "warning":
            return "orange";
        case "danger":
            return "red";
        case "default":
            return "gray";
        default:
            return "blue";
    }
}
