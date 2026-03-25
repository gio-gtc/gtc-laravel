export default function Heading({
    title,
    description,
    type = 'page',
}: {
    title: string;
    description?: string;
    type?: 'page' | 'section' | 'small';
}) {
    const styles = {
        container: '',
        title: '',
        description: '',
    };

    switch (type) {
        case 'section':
            styles.title = 'text-lg font-semibold';
            styles.description = 'text-sm text-muted-foreground';
            break;
        case 'small':
            styles.title = 'mb-0.5 text-base font-medium';
            styles.description = 'text-sm text-muted-foreground';
            break;
        default:
            styles.container = 'mb-4 space-y-0.5';
            styles.title = 'text-xl font-semibold tracking-tight';
            styles.description = 'text-gray-600';
            break;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{title}</h2>
            {description && <p className={styles.description}>{description}</p>}
        </div>
    );
}
