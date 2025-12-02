
export enum GameState {
  Ready,
  Playing,
  GameOver,
}

export interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
}
