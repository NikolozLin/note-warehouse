# electron  渲染进程、主进程通信方法



main.js

```typescript
import { ipcMain } from 'electron';

ipcMain.handle('an-action', async (event, arg) => {
    // do stuff
    await awaitableProcess();
    return "foo";
}

```

renderer.js

```typescript
import { ipcRenderer } from 'electron';

(async () => {
    const result = await ipcRenderer.invoke('an-action', [1, 2, 3]);
    console.log(result); // prints "foo"
})();
```



Ipcmain.handle 和 ipcrenderer.invoke 可以通过contextBirdge 暴露主进程的api 给予renderer进程

---

main.js

```typescript
import { ipcMain, BrowserWindow } from 'electron';

ipcMain.handle('an-action', async (event, arg) => {
    // do stuff
    await awaitableProcess();
    return "foo";
}
new BrowserWindow({
    ...
    webPreferences: {
        contextIsolation: true,
        preload: "preload.js" // MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY if you're using webpack
    }
    ...
});
```



preload.js

```typescript
import { ipcRenderer, contextBridge } from 'electron';

// Adds an object 'api' to the global window object:
contextBridge.exposeInMainWorld('api', {
    doAction: async (arg) => {
        return await ipcRenderer.invoke('an-action', arg);
    }
});
```

renderer.js

```typescript
(async () => {
    const response = await window.api.doAction([1,2,3]);
    console.log(response); // we now have the response from the main thread without exposing
                           // ipcRenderer, leaving the app less vulnerable to attack    
})();
```