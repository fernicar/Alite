import { ColorScheme } from "../../../colors/ColorScheme";
import { L } from "../../../L";

export class Economy {
    public static readonly RICH_INDUSTRIAL = new Economy(ColorScheme.COLOR_RICH_INDUSTRIAL, "economy_rich_industrial");
    public static readonly AVERAGE_INDUSTRIAL = new Economy(ColorScheme.COLOR_AVERAGE_INDUSTRIAL, "economy_average_industrial");
    public static readonly POOR_INDUSTRIAL = new Economy(ColorScheme.COLOR_POOR_INDUSTRIAL, "economy_poor_industrial");
    public static readonly MAINLY_INDUSTRIAL = new Economy(ColorScheme.COLOR_MAIN_INDUSTRIAL, "economy_mainly_industrial");
    public static readonly MAINLY_AGRICULTURAL = new Economy(ColorScheme.COLOR_MAIN_AGRICULTURAL, "economy_mainly_agricultural");
    public static readonly RICH_AGRICULTURAL = new Economy(ColorScheme.COLOR_RICH_AGRICULTURAL, "economy_rich_agricultural");
    public static readonly AVERAGE_AGRICULTURAL = new Economy(ColorScheme.COLOR_AVERAGE_AGRICULTURAL, "economy_average_agricultural");
    public static readonly POOR_AGRICULTURAL = new Economy(ColorScheme.COLOR_POOR_AGRICULTURAL, "economy_poor_agricultural");

    private constructor(private colorIndex: number, private descriptionKey: string) {}

    public getDescription(): string {
        return L.string(this.descriptionKey);
    }

    public getColor(): number {
        return ColorScheme.get(this.colorIndex);
    }
}
