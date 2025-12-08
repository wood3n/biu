import React from "react";
import { type Control, Controller } from "react-hook-form";

import { Checkbox, CheckboxGroup } from "@heroui/react";

import { DefaultMenuList } from "@/common/constants/menus";
import { useUser } from "@/store/user";

interface MenuSettingsProps {
  control: Control<AppSettings>;
}

const MenuSettings: React.FC<MenuSettingsProps> = ({ control }) => {
  const user = useUser(state => state.user);
  const ownFolder = useUser(state => state.ownFolder);
  const collectedFolder = useUser(state => state.collectedFolder);

  return (
    <div className="space-y-6">
      <h2>设置侧边菜单项显示和隐藏</h2>
      <div className="w-full space-y-8">
        <div className="flex w-full items-start space-x-[100px]">
          <div className="text-medium font-medium">系统默认菜单</div>
          <div className="max-w-[480px]">
            <Controller
              control={control}
              name="hiddenMenuKeys"
              render={({ field }) => {
                const groupKeys = DefaultMenuList.map(i => i.href);
                const selectedKeys = groupKeys.filter(k => !field.value.includes(k));
                return (
                  <CheckboxGroup
                    aria-label="系统默认菜单显示项"
                    value={selectedKeys}
                    onValueChange={keys => {
                      const outsideHidden = field.value.filter(k => !groupKeys.includes(k));
                      const hiddenInGroup = groupKeys.filter(k => !(keys as string[]).includes(k));
                      const nextHidden = Array.from(new Set([...outsideHidden, ...hiddenInGroup]));
                      field.onChange(nextHidden);
                    }}
                    color="primary"
                    orientation="horizontal"
                    classNames={{
                      wrapper: "gap-4",
                    }}
                  >
                    {DefaultMenuList.map(item => (
                      <Checkbox key={item.href} value={item.href}>
                        {item.title}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                );
              }}
            />
          </div>
        </div>

        {user?.isLogin && (
          <>
            <div className="flex w-full items-start space-x-[100px]">
              <div className="text-medium font-medium">个人创建菜单</div>
              <div className="max-w-[480px]">
                <Controller
                  control={control}
                  name="hiddenMenuKeys"
                  render={({ field }) => {
                    const groupKeys = (ownFolder ?? []).map(i => String(i.id));
                    const selectedKeys = groupKeys.filter(k => !field.value.includes(k));
                    return (
                      <CheckboxGroup
                        aria-label="个人创建菜单显示项"
                        value={selectedKeys}
                        onValueChange={keys => {
                          const outsideHidden = field.value.filter(k => !groupKeys.includes(k));
                          const hiddenInGroup = groupKeys.filter(k => !(keys as string[]).includes(k));
                          const nextHidden = Array.from(new Set([...outsideHidden, ...hiddenInGroup]));
                          field.onChange(nextHidden);
                        }}
                        isDisabled={!groupKeys.length}
                        color="primary"
                        orientation="horizontal"
                        classNames={{
                          wrapper: "gap-4",
                        }}
                      >
                        {groupKeys.map(key => (
                          <Checkbox key={key} value={key}>
                            {ownFolder?.find(i => String(i.id) === key)?.title}
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    );
                  }}
                />
              </div>
            </div>
            <div className="flex w-full items-start space-x-[100px]">
              <div className="text-medium font-medium">个人收藏菜单</div>
              <div className="max-w-[480px]">
                <Controller
                  control={control}
                  name="hiddenMenuKeys"
                  render={({ field }) => {
                    const groupKeys = (collectedFolder ?? []).map(i => String(i.id));
                    const selectedKeys = groupKeys.filter(k => !field.value.includes(k));
                    return (
                      <CheckboxGroup
                        aria-label="个人收藏菜单显示项"
                        value={selectedKeys}
                        onValueChange={keys => {
                          const outsideHidden = field.value.filter(k => !groupKeys.includes(k));
                          const hiddenInGroup = groupKeys.filter(k => !(keys as string[]).includes(k));
                          const nextHidden = Array.from(new Set([...outsideHidden, ...hiddenInGroup]));
                          field.onChange(nextHidden);
                        }}
                        isDisabled={!groupKeys.length}
                        color="primary"
                        orientation="horizontal"
                        classNames={{
                          wrapper: "gap-4",
                        }}
                      >
                        {groupKeys.map(key => (
                          <Checkbox key={key} value={key}>
                            {collectedFolder?.find(i => String(i.id) === key)?.title}
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    );
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MenuSettings;
