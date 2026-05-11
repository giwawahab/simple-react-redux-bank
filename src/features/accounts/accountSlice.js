import { createSlice } from "@reduxjs/toolkit";

// Customer Initial State
const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    deposit(state, action) {
      state.balance += Number(action.payload);
      state.isLoading = false
    },

    withdraw(state, action) {
      state.balance -= Number(action.payload);
    },

    requestLoan: {
      prepare(amount, purpose) {
        return {
          payload: { amount, purpose },
        };
      },
      reducer(state, action) {
        if (state.loan > 0) return;

        state.loan = action.payload.amount;
        state.loanPurpose = action.payload.purpose;
        state.balance += Number(action.payload.amount);
      },
    },

    payLoan(state) {
      state.balance -= Number(state.loan);
      state.loan = 0;
      state.loanPurpose = "";
    },

    convertingCurrency(state){
      state.isLoading = true; 
    }
  },
});

export const { withdraw, requestLoan, payLoan } = accountSlice.actions;
export default accountSlice.reducer;

export function deposit(amount, currency) {
  if (currency === "USD") return { type: "account/deposit", payload: amount };

  return async function (dispatch, getState) {
    dispatch({ type: "account/convertingCurrency" });
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${currency}&symbols=USD`,
    );
    const data = await res.json();
    const converted = (amount * data.rates["USD"]).toFixed(2);

    dispatch({ type: "account/deposit", payload: converted });
  };
}
