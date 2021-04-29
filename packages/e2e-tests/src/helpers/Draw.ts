import { MainMap } from './MainMap';

const waitTimeBeforeMs = 200;
const waitTimeAfterMs = 400;
const drawReference = { x: 100, y: 100 };
const defaultOptions = { button: 0, pointerId: 1 };

export class Draw {
  /**
   * Click then wait a little, because when tests are passed headless, actions can be too fast for assertions.
   */
  public static click(x: number, y: number, options?: MouseEventInit): Cypress.Chainable<any> {
    const coords = this.coords(x, y);
    const _options = {
      ...defaultOptions,
      ...options,
    };
    return cy
      .then(() => MainMap.getComponent())
      .trigger('pointermove', x, y, _options)
      .wait(waitTimeBeforeMs)
      .click(...coords, _options)
      .wait(waitTimeAfterMs);
  }

  /**
   * Double click then wait a little, because when tests are passed headless, actions can be too fast for assertions.
   */
  public static dblclick(x: number, y: number, options?: MouseEventInit): Cypress.Chainable<any> {
    const coords = this.coords(x, y);
    const _options = {
      ...defaultOptions,
      ...options,
    };
    return cy
      .then(() => MainMap.getComponent())
      .trigger('pointermove', x, y, _options)
      .wait(waitTimeBeforeMs)
      .dblclick(...coords, _options)
      .wait(waitTimeAfterMs);
  }

  /**
   * This method simulate cursor dragging in a way that openlayers can detect it
   */
  public static drag(fromX: number, fromY: number, toX: number, toY: number, options?: MouseEventInit): Cypress.Chainable<any> {
    const from = this.coords(fromX, fromY);
    const to = this.coords(toX, toY);
    const _options = {
      ...defaultOptions,
      ...options,
    };
    // moves are arbitrary, but it does not impact result
    return cy
      .then(() => MainMap.getComponent())
      .trigger('pointermove', from[0], from[1], _options)
      .wait(waitTimeBeforeMs)
      .trigger('pointerdown', from[0], from[1], _options)
      .trigger('pointermove', from[0] + 10, from[1] + 10, _options)
      .trigger('pointermove', from[0] + 20, from[1] + 20, _options)
      .trigger('pointermove', to[0], to[1], _options)
      .trigger('pointerup', to[0], to[1], _options)
      .wait(waitTimeAfterMs);
  }

  /**
   * Translate coords from draw reference
   */
  public static coords(x: number, y: number): [number, number] {
    return [drawReference.x + x, drawReference.y + y];
  }
}
