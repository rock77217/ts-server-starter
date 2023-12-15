import _ from "lodash";

test("Empty test", () => {
    expect(_.isEmpty(undefined)).toBe(true);
    expect(_.isEmpty(null)).toBe(true);
    expect(_.isEmpty([])).toBe(true);
    expect(_.isEmpty({})).toBe(true);
});