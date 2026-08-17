import type { ReactNode } from 'react'

export function toggleMarkdownStyle(
  value: string,
  start: number,
  end: number,
  style: 'bold' | 'italic',
): { value: string; start: number; end: number } {
  let from = start
  let to = end
  const selected = value.slice(from, to)
  const wrapped = selected.match(/^(\*{1,3})([\s\S]*?)\1$/)
  if (wrapped?.[1] && wrapped[2] !== undefined) {
    from += wrapped[1].length
    to -= wrapped[1].length
  }

  const pair = Math.min(countStars(value, from - 1, -1), countStars(value, to, 1))
  const isBold = pair >= 2
  const isItalic = pair % 2 === 1
  const wantBold = style === 'bold' ? !isBold : isBold
  const wantItalic = style === 'italic' ? !isItalic : isItalic

  let nextPair = 0
  if (wantBold) nextPair += 2
  if (wantItalic) nextPair += 1

  const inner = value.slice(from, to)
  const before = value.slice(0, from - pair)
  const after = value.slice(to + pair)
  const markers = '*'.repeat(nextPair)
  const next = `${before}${markers}${inner}${markers}${after}`
  const caret = before.length + markers.length
  return { value: next, start: caret, end: caret + inner.length }
}

export function RichText({ text }: { text: string }) {
  if (!text) return '—'
  return <>{parseMarkers(text, '***', wrapBoth, parseStrong)}</>
}

function countStars(value: string, from: number, direction: -1 | 1): number {
  let count = 0
  let index = from
  while (index >= 0 && index < value.length && value[index] === '*') {
    count += 1
    index += direction
  }
  return count
}

function wrapBoth(inner: ReactNode, key: number): ReactNode {
  return (
    <strong key={`both-${key}`}>
      <em>{inner}</em>
    </strong>
  )
}

function wrapStrong(inner: ReactNode, key: number): ReactNode {
  return <strong key={`strong-${key}`}>{inner}</strong>
}

function wrapEm(inner: ReactNode, key: number): ReactNode {
  return <em key={`em-${key}`}>{inner}</em>
}

function parseStrong(text: string): ReactNode[] {
  return parseMarkers(text, '**', wrapStrong, parseEm)
}

function parseEm(text: string): ReactNode[] {
  return parseMarkers(text, '*', wrapEm, (plain) => (plain ? [plain] : []))
}

function parseMarkers(
  text: string,
  marker: string,
  wrap: (inner: ReactNode, key: number) => ReactNode,
  parseRest: (text: string) => ReactNode[],
): ReactNode[] {
  const nodes: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const open = remaining.indexOf(marker)
    if (open === -1) {
      nodes.push(...parseRest(remaining))
      break
    }

    const close = remaining.indexOf(marker, open + marker.length)
    if (close === -1) {
      nodes.push(...parseRest(remaining))
      break
    }

    if (open > 0) nodes.push(...parseRest(remaining.slice(0, open)))
    nodes.push(wrap(parseRest(remaining.slice(open + marker.length, close)), key))
    remaining = remaining.slice(close + marker.length)
    key += 1
  }

  return nodes
}
