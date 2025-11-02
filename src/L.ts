export class L {
    private static strings: { [key: string]: string } = {};

    public static async load(language: string) {
        try {
            const response = await fetch(`/locales/${language}.json`);
            this.strings = await response.json();
        } catch (error) {
            console.error(`Could not load language file for ${language}.`, error);
        }
    }

    public static string(key: string, ...formatArgs: any[]): string {
        const value = this.strings[key] || key;
        // Basic string formatting
        if (formatArgs.length > 0) {
            return value.replace(/{(\d+)}/g, (match, number) => {
                return typeof formatArgs[number] !== 'undefined' ? formatArgs[number] : match;
            });
        }
        return value;
    }
}
