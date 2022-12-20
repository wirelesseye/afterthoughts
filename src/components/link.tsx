import { useRouter } from "../contexts/router-context";

export interface LinkProps extends React.HTMLProps<HTMLAnchorElement> {}

export function Link(props: LinkProps) {
    const router = useRouter();

    const { onClick, ...other } = props;

    const _onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        if (props.href) router.navigate(props.href, props.target);
        if (onClick) onClick(e);
    };

    return <a {...other} onClick={_onClick} />;
}
