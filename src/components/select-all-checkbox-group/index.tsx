import React from "react";

import { Checkbox, CheckboxGroup } from "@heroui/react";

interface SelectAllCheckboxGroupProps {
  groupName: string;
  groupKeys: string[];
  selectedKeys: string[];
  onSelectionChange: (keys: string[]) => void;
  disabled?: boolean;
  items: Array<{ value: string; label: string }>;
}

const SelectAllCheckboxGroup: React.FC<SelectAllCheckboxGroupProps> = ({
  groupName,
  groupKeys,
  selectedKeys,
  onSelectionChange,
  disabled = false,
  items,
}) => {
  const isSelectAll = groupKeys.length > 0 && selectedKeys.length === groupKeys.length;

  const handleSelectAllChange = (checked: boolean) => {
    onSelectionChange(checked ? groupKeys : []);
  };

  const handleCheckboxGroupChange = (keys: string[]) => {
    onSelectionChange(keys);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Checkbox
          value="select-all"
          isSelected={isSelectAll}
          onValueChange={handleSelectAllChange}
          isDisabled={disabled || !groupKeys.length}
          color="primary"
        >
          全选
        </Checkbox>
      </div>
      <CheckboxGroup
        aria-label={`${groupName}显示项`}
        value={selectedKeys}
        onValueChange={handleCheckboxGroupChange}
        isDisabled={disabled || !groupKeys.length}
        color="success"
        orientation="horizontal"
        classNames={{
          wrapper: "gap-4",
        }}
      >
        {items.map(item => (
          <Checkbox key={item.value} value={item.value} color="primary">
            {item.label}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  );
};

export default SelectAllCheckboxGroup;
