export interface NavLinkItem {
  label: string;
  href: string;
  /** Small icon badge shown at the top-right corner of the link label. */
  badge?: 'new'
}

export interface NavbarProps {
  className?: string;
}
