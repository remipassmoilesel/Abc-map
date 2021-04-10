import { UpdateStyleTask } from './UpdateStyleTask';
import { TestHelper } from '../../../utils/TestHelper';
import { FeatureWrapper } from '../../../geo/features/FeatureWrapper';

describe('UpdateStyleTask', function () {
  it('should set style on undo', function () {
    const feature = FeatureWrapper.create();
    const before = TestHelper.sampleStyleProperties();
    before.stroke = {
      ...before.stroke,
      width: 10,
    };

    const after = TestHelper.sampleStyleProperties();
    after.stroke = {
      ...before.stroke,
      width: 20,
    };

    const task = new UpdateStyleTask([{ feature, before, after }]);

    task.undo();
    expect(feature.getStyleProperties().stroke?.width).toEqual(10);

    task.redo();
    expect(feature.getStyleProperties().stroke?.width).toEqual(20);
  });
});