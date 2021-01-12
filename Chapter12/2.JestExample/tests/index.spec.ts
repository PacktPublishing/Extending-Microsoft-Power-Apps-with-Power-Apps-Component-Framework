import { MyCharacterCounter } from "../MyCharCount/index";

describe("CharacterCounter", () => {
  let instance: MyCharacterCounter;

  beforeEach(() => {
    instance = new MyCharacterCounter();
  });

  it("should get positive number", () => {
    expect(instance).toBeInstanceOf(MyCharacterCounter);
    const chars = instance.GetCharacterCount(100, 90);
    expect(chars).toEqual(10);
  });

  it("should get negative number", () => {
    expect(instance).toBeInstanceOf(MyCharacterCounter);
    const chars = instance.GetCharacterCount(100, 110);
    expect(chars).toEqual(-10);
  });

  it("should get zero", () => {
    expect(instance).toBeInstanceOf(MyCharacterCounter);
    const chars = instance.GetCharacterCount(100, 100);
    expect(chars).toEqual(0);
  });
});
