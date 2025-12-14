import React, { useRef } from "react";

import { Button, addToast } from "@heroui/react";
import { RiExportFill, RiImportFill } from "@remixicon/react";
import { merge } from "es-toolkit/object";

import { useSettings } from "@/store/settings";
import { defaultAppSettings } from "@shared/settings/app-settings";

const ImportExport = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateSettings = useSettings(s => s.update);
  const getSettings = useSettings(s => s.getSettings);

  const handleExport = async () => {
    try {
      const settingStore = (await window.electron.getStore("app-settings")) as { appSettings: AppSettings };
      const blob = new Blob([JSON.stringify(settingStore.appSettings, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `biu-settings-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      addToast({ title: "已导出配置", description: "JSON 文件已下载", color: "success" });
    } catch (e) {
      addToast({ title: "导出失败", description: String(e), color: "danger" });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange: React.ChangeEventHandler<HTMLInputElement> = async e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Record<string, unknown>;

      const patch: Record<string, unknown> = {};
      for (const key of Object.keys(defaultAppSettings)) {
        patch[key] = data[key];
      }

      const merged = merge(getSettings(), patch);

      updateSettings(merged);
      addToast({ title: "已导入配置", description: "设置已应用", color: "success" });
      window.location.reload();
    } catch {
      addToast({ title: "导入失败", description: "文件解析错误或格式不正确", color: "danger" });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFileChange} />
      <Button size="sm" startContent={<RiExportFill size={16} />} onPress={handleExport}>
        导出配置
      </Button>
      <Button size="sm" startContent={<RiImportFill size={16} />} onPress={handleImportClick}>
        导入配置
      </Button>
    </div>
  );
};

export default ImportExport;
