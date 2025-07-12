import React from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  options: Option[];
  value?: string;
  onFilterChange: (value: string) => void;
}

export const FilterDropdown: React.FC<Props> = ({ label, options, value = "", onFilterChange }) => (
  <div className="filter-dropdown">
    {label && <label>{label}:</label>}
    <select value={value} onChange={(e) => onFilterChange(e.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);
