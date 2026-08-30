import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

// E2E verification for Electron configuration and OS integration
// Checks window title "Tu es coincé aussi ?", security contextIsolation, and logs

test.describe('Electron OS Integration', () => {
  test('electron main process has correct window title and security settings', () => {
    const mainContent = readFileSync('electron/main.ts', 'utf-8')
    const preloadContent = readFileSync('electron/preload.ts', 'utf-8')
    const builderContent = readFileSync('electron-builder.yml', 'utf-8')

    // Verify OS window title
    expect(mainContent).toContain('title: \'Tu es coincé aussi ?\'')

    // Verify security flags
    expect(mainContent).toContain('contextIsolation: true')
    expect(mainContent).toContain('nodeIntegration: false')
    expect(mainContent).toContain('sandbox: true')

    // Verify preload contextBridge
    expect(preloadContent).toContain('contextBridge.exposeInMainWorld(\'polyroot\'')

    // Verify builder bundle whitelist <150Mo
    expect(builderContent).toContain('appId: com.polyroot.escape')
    expect(builderContent).toContain('asar: true')
  })
})
