interface HintBarProps { category: string; visible: boolean; onShow: () => void }

export function HintBar({ category, visible, onShow }: HintBarProps) {
  return visible
    ? <p role="status">힌트: {category} 단어예요.</p>
    : <button type="button" onClick={onShow}>힌트 보기</button>;
}
