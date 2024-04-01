const assert = require('assert');
const { categoriesService } = require('../../src/services');

describe('categoriesService', () => {
  it('should return all categories', async () => {
    const [count, categories] = await categoriesService.getAll();
    assert.equal(count > 0, true);
    assert.equal(categories.length > 0, true);
  }).timeout(4000);
});

describe('categoriesService', () => {
  it('should return one category', async () => {
    const element = await categoriesService.getById('65f8e521fbbe43007b1fc669');
    assert.equal(element !== null, true);
  });
}).timeout(4000);

describe('categoriesService', () => {
  it('should return no category', async () => {
    const element = await categoriesService.getById('65f8e521fbbe43007b1fc661');

    assert.equal(element === null, true);
  });
});
