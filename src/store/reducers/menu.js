import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Define menu items for each login type
const menuItemsByRole = {
  admin: ['dashboard', 'user', 'course', 'category', 'roles', 'logs', 'payment'],
  tutor: ['dashboard', 'user', 'course', 'category', 'roles', 'logs'],
  student: ['dashboard', 'user', 'course', 'payment', 'logs']
};

// initial state
const initialState = {
  openItem: ['dashboard'], // Default to dashboard only
  openComponent: 'buttons',
  selectedID: null,
  drawerOpen: false,
  componentDrawerOpen: true,
  menu: {},
  error: null
};

// ==============================|| SLICE - MENU ||============================== //

export const fetchMenu = createAsyncThunk('menu/fetchMenu', async () => {
  return Promise.resolve({ dashboard: ['dashboard'] });
});

export const initializeMenu = createAsyncThunk('menu/initialize', async () => {
  const auth = JSON.parse(localStorage.getItem('auth'));
  const loginType = auth?.loginType;
  if (!loginType) {
    return { openItem: ['dashboard'] };
  }

  return {
    openItem: menuItemsByRole[loginType]
  };
});

const menu = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    activeItem(state, action) {
      state.openItem = action.payload.openItem;
    },

    activeID(state, action) {
      state.selectedID = action.payload;
    },

    activeComponent(state, action) {
      state.openComponent = action.payload.openComponent;
    },

    openDrawer(state, action) {
      state.drawerOpen = action.payload;
    },

    openComponentDrawer(state, action) {
      state.componentDrawerOpen = action.payload.componentDrawerOpen;
    },

    hasError(state, action) {
      state.error = action.payload;
    },

    // Add a new reducer to set menu items directly
    setMenuItems(state, action) {
      state.openItem = action.payload;
    }
  },

  extraReducers(builder) {
    builder
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.menu = action.payload.dashboard;
      })
      .addCase(initializeMenu.fulfilled, (state, action) => {
        state.openItem = action.payload.openItem;
      });
  }
});

export default menu.reducer;

export const { activeItem, activeComponent, openDrawer, openComponentDrawer, activeID, setMenuItems } = menu.actions;
