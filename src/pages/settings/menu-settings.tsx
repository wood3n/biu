import React from "react";
import { type Control, Controller } from "react-hook-form";

import { DefaultMenuList } from "@/common/constants/menus";
import SelectAllCheckboxGroup from "@/components/select-all-checkbox-group";
import { useFavoritesStore } from "@/store/favorite";
import { useUser } from "@/store/user";

interface MenuSettingsProps {
  control: Control<AppSettings>;
}

const MenuSettings: React.FC<MenuSettingsProps> = ({ control }) => {
  const user = useUser(state => state.user);
  const createdFavorites = useFavoritesStore(state => state.createdFavorites);
  const collectedFavorites = useFavoritesStore(state => state.collectedFavorites);

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
                const groupKeys = DefaultMenuList.filter(i => i.href).map(i => i.href!);
                const selectedKeys = groupKeys.filter(k => !field.value.includes(k));

                const handleSelectionChange = (newSelectedKeys: string[]) => {
                  const outsideHidden = field.value.filter(k => !groupKeys.includes(k));
                  const hiddenInGroup = groupKeys.filter(k => !newSelectedKeys.includes(k));
                  const nextHidden = Array.from(new Set([...outsideHidden, ...hiddenInGroup]));
                  field.onChange(nextHidden);
                };

                const items = DefaultMenuList.filter(i => (user?.isLogin ? true : !i.needLogin)).map(item => ({
                  value: item.href!,
                  label: item.title,
                }));

                return (
                  <SelectAllCheckboxGroup
                    groupName="系统默认菜单"
                    groupKeys={groupKeys}
                    selectedKeys={selectedKeys}
                    onSelectionChange={handleSelectionChange}
                    items={items}
                  />
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
                    const groupKeys = (createdFavorites ?? []).map(i => String(i.id));
                    const selectedKeys = groupKeys.filter(k => !field.value.includes(k));

                    const handleSelectionChange = (newSelectedKeys: string[]) => {
                      const outsideHidden = field.value.filter(k => !groupKeys.includes(k));
                      const hiddenInGroup = groupKeys.filter(k => !newSelectedKeys.includes(k));
                      const nextHidden = Array.from(new Set([...outsideHidden, ...hiddenInGroup]));
                      field.onChange(nextHidden);
                    };

                    const ownFolderMap = new Map((createdFavorites ?? []).map(i => [String(i.id), i.title]));
                    const items = groupKeys.map(key => ({
                      value: key,
                      label: ownFolderMap.get(key) || key,
                    }));

                    return (
                      <SelectAllCheckboxGroup
                        groupName="个人创建菜单"
                        groupKeys={groupKeys}
                        selectedKeys={selectedKeys}
                        onSelectionChange={handleSelectionChange}
                        disabled={!groupKeys.length}
                        items={items}
                      />
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
                    const groupKeys = (collectedFavorites ?? []).map(i => String(i.id));
                    const selectedKeys = groupKeys.filter(k => !field.value.includes(k));

                    const handleSelectionChange = (newSelectedKeys: string[]) => {
                      const outsideHidden = field.value.filter(k => !groupKeys.includes(k));
                      const hiddenInGroup = groupKeys.filter(k => !newSelectedKeys.includes(k));
                      const nextHidden = Array.from(new Set([...outsideHidden, ...hiddenInGroup]));
                      field.onChange(nextHidden);
                    };

                    const collectedFolderMap = new Map((collectedFavorites ?? []).map(i => [String(i.id), i.title]));
                    const items = groupKeys.map(key => ({
                      value: key,
                      label: collectedFolderMap.get(key) || key,
                    }));

                    return (
                      <SelectAllCheckboxGroup
                        groupName="个人收藏菜单"
                        groupKeys={groupKeys}
                        selectedKeys={selectedKeys}
                        onSelectionChange={handleSelectionChange}
                        disabled={!groupKeys.length}
                        items={items}
                      />
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
