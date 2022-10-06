import argon2 from "argon2";
import { ROLES } from "@configs/settings";
import { createUserWithSecret } from "@services/auth.service";

test("Init user", async () => {
    const user = await createUserWithSecret("test", Object.values(ROLES).filter((v) => isNaN(Number(v))), false);
    expect(user.user.secret).not.toBeUndefined();
    const secretCheckt = await argon2.verify(user.user.secret!, user.secret);
    expect(secretCheckt).toBe(true);
})