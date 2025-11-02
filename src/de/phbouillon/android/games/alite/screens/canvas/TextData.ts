import { GLText } from "../../framework/impl/gl/font/GLText";

export interface TextData {
    text: string;
    x: number;
    y: number;
    color: number;
    font: GLText;
}
