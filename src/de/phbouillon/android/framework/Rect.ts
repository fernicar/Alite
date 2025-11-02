export class Rect {
    public static inside(x: number, y: number, x1: number, y1: number, x2: number, y2: number): boolean {
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }
}
