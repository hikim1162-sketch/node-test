import type { CardOption } from "../../types/card";

interface ChoiceOptionsProps {
  options: CardOption[];
  selected?: string;
  disabled?: boolean;
  onSelect: (value: string) => void;
}

export function ChoiceOptions({ options, selected, disabled, onSelect }: ChoiceOptionsProps) {
  return <div role="group" aria-label="정답 선택">
    {options.map((option) => <button key={option.value} type="button" disabled={disabled} aria-pressed={selected === option.value} onClick={() => onSelect(option.value)}>
      {option.imageUrl ? <img src={option.imageUrl} alt="비교할 그림" /> : option.label ?? option.value}
    </button>)}
  </div>;
}
