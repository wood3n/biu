import React from "react";
import { Controller, type Control } from "react-hook-form";

import { Form, Input, Select, SelectItem } from "@heroui/react";

interface ProxySettingsProps {
  control: Control<AppSettings>;
}

const PROXY_TYPE_OPTIONS: { key: ProxyType; label: string }[] = [
  { key: "none", label: "不使用代理" },
  { key: "http", label: "HTTP 代理" },
  { key: "socks4", label: "SOCKS4 代理" },
  { key: "socks5", label: "SOCKS5 代理" },
];

const ProxySettings: React.FC<ProxySettingsProps> = ({ control }) => {
  return (
    <Form className="space-y-6">
      <Controller
        control={control}
        name="proxySettings"
        render={({ field }) => {
          const value = field.value ?? {
            type: "none" as ProxyType,
            host: "",
            port: undefined,
            username: "",
            password: "",
          };

          const setProxy = (patch: Partial<ProxySettings>) => {
            field.onChange({
              ...value,
              ...patch,
            });
          };

          const showPassword = value.type === "http" || value.type === "socks5";

          return (
            <div className="space-y-4">
              <div className="w-[240px]">
                <Select
                  aria-label="代理类型"
                  selectedKeys={new Set([value.type])}
                  onSelectionChange={keys => {
                    const next = Array.from(keys)[0] as ProxyType | undefined;
                    setProxy({
                      type: next ?? "none",
                    });
                  }}
                >
                  {PROXY_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>
              </div>

              {(value.type === "http" || value.type === "socks4" || value.type === "socks5") && (
                <>
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-4 text-sm text-zinc-500">
                      <span>主机</span>
                      <span>端口</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="主机" value={value.host ?? ""} onValueChange={v => setProxy({ host: v })} />
                      <Input
                        placeholder="端口"
                        inputMode="numeric"
                        value={value.port ? String(value.port) : ""}
                        onValueChange={v => {
                          const trimmed = v.trim();
                          const num = Number(trimmed);
                          setProxy({ port: Number.isFinite(num) && num > 0 ? num : undefined });
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-4 text-sm text-zinc-500">
                      <span>用户名</span>
                      {showPassword && <span>密码</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="用户名"
                        value={value.username ?? ""}
                        onValueChange={v => setProxy({ username: v })}
                      />
                      {showPassword && (
                        <Input
                          placeholder="密码"
                          type="password"
                          value={value.password ?? ""}
                          onValueChange={v => setProxy({ password: v })}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        }}
      />
    </Form>
  );
};

export default ProxySettings;
