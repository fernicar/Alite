import { L } from "../../../L";

export class Government {
    public static readonly ANARCHY = new Government("government_anarchy");
    public static readonly FEUDAL = new Government("government_feudal");
    public static readonly MULTI_GOVERNMENT = new Government("government_multi_government");
    public static readonly DICTATORSHIP = new Government("government_dictatorship");
    public static readonly COMMUNIST = new Government("government_communist");
    public static readonly CONFEDERACY = new Government("government_confederacy");
    public static readonly DEMOCRACY = new Government("government_democracy");
    public static readonly CORPORATE_STATE = new Government("government_corporate_state");

    private constructor(private descriptionKey: string) {}

    public getDescription(): string {
        return L.string(this.descriptionKey);
    }
}
