import { MainMap } from './MainMap';

const waitTimeBeforeMs = 200;
const waitTimeAfterMs = 400;
const drawReference = { x: 100, y: 100 };
const mouseEvent = { button: 0, pointerId: 1 };

export class Draw {
  /**
   * Click then wait a little, because when tests are passed headless, actions can be too fast for assertions.
   * @param x
   * @param y
   */
  public static click(x: number, y: number): Cypress.Chainable<any> {
    const coords = this.coords(x, y);
    return cy
      .get(MainMap.getSelector())
      .trigger('pointermove', x, y, mouseEvent)
      .wait(waitTimeBeforeMs)
      .click(...coords)
      .wait(waitTimeAfterMs);
  }

  /**
   * Double click then wait a little, because when tests are passed headless, actions can be too fast for assertions.
   * @param x
   * @param y
   */
  public static dblclick(x: number, y: number): Cypress.Chainable<any> {
    const coords = this.coords(x, y);
    return cy
      .get(MainMap.getSelector())
      .trigger('pointermove', x, y, mouseEvent)
      .wait(waitTimeBeforeMs)
      .dblclick(...coords)
      .wait(waitTimeAfterMs);
  }

  /**
   * Translate coords from draw reference
   * @param x
   * @param y
   */
  public static coords(x: number, y: number): [number, number] {
    return [drawReference.x + x, drawReference.y + y];
  }

  /**
   * This method simulate cursor dragging in a way that openlayers can detect it
   * @param fromX
   * @param fromY
   * @param toX
   * @param toY
   */
  public static drag(fromX: number, fromY: number, toX: number, toY: number): Cypress.Chainable<any> {
    const from = this.coords(fromX, fromY);
    const to = this.coords(toX, toY);
    // moves are arbitrary, but it does not impact result
    return cy
      .get(MainMap.getSelector())
      .trigger('pointermove', from[0], from[1], mouseEvent)
      .wait(waitTimeBeforeMs)
      .trigger('pointerdown', from[0], from[1], mouseEvent)
      .trigger('pointermove', from[0] + 10, from[1] + 10, mouseEvent)
      .trigger('pointermove', from[0] + 20, from[1] + 20, mouseEvent)
      .trigger('pointermove', to[0], to[1], mouseEvent)
      .trigger('pointerup', to[0], to[1], mouseEvent)
      .wait(waitTimeAfterMs);
  }
}