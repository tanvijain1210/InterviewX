// redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null
  },
  reducers: {
    setUserData: (state, action) => {
      const payload = action.payload;

      if (!payload) {
        state.userData = null;
        return;
      }

      // Extract raw user object whether payload is raw user OR response wrapper
      const user = payload.user ? payload.user : payload;

      // Force normalize credit and credits to be identical
      const creditVal = user.credit ?? user.credits ?? 0;

      state.userData = {
        ...user,
        credit: creditVal,
      };
    }
  }
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;