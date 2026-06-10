const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#f8f9fa'
  });

  // Cargar la aplicación
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Crear menú personalizado profesional
  const menuTemplate = [
    {
      label: 'PizzApp',
      submenu: [
        {
          label: 'Acerca de PizzApp',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de PizzApp',
              message: 'PizzApp - Sistema de Gestión de Pizzería',
              detail: 'Versión 1.0.0\n\nDesarrollado para la gestión eficiente de pedidos, inventario y clientes.\n\n© 2024 PizzApp - Todos los derechos reservados.',
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        { label: 'Salir', role: 'quit', accelerator: 'CmdOrCtrl+Q' }
      ]
    },
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Recargar',
          role: 'reload',
          accelerator: 'CmdOrCtrl+R'
        },
        {
          label: 'Recargar Completo',
          role: 'forceReload',
          accelerator: 'CmdOrCtrl+Shift+R'
        },
        { type: 'separator' },
        {
          label: 'Pantalla Completa',
          role: 'togglefullscreen',
          accelerator: 'F11'
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { label: 'Zoom +', role: 'zoomIn', accelerator: 'CmdOrCtrl+=' },
        { label: 'Zoom -', role: 'zoomOut', accelerator: 'CmdOrCtrl+-' },
        { label: 'Restablecer Zoom', role: 'resetZoom', accelerator: 'CmdOrCtrl+0' },
        { type: 'separator' },
        { label: 'Desarrollador', role: 'toggleDevTools', accelerator: 'F12' }
      ]
    },
    {
      label: 'Ventanas',
      submenu: [
        { label: 'Minimizar', role: 'minimize', accelerator: 'CmdOrCtrl+M' },
        { label: 'Cerrar', role: 'close', accelerator: 'CmdOrCtrl+W' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Documentación',
          click: async () => {
            await shell.openExternal('https://github.com/tu-usuario/pizzapp');
          }
        },
        {
          label: 'Reportar Problema',
          click: async () => {
            await shell.openExternal('https://github.com/tu-usuario/pizzapp/issues');
          }
        },
        { type: 'separator' },
        {
          label: 'Soporte',
          click: async () => {
            await shell.openExternal('mailto:soporte@pizzapp.com');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Prevenir que la aplicación se cierre en macOS al cerrar todas las ventanas
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});