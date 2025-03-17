'use client'

import React from 'react'

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: 'simple' | 'striped'
}

type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>
type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>
type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>
type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>
type TableHeaderCellProps = React.ThHTMLAttributes<HTMLTableHeaderCellElement>

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', variant = 'simple', children, ...props }, ref) => {
    const baseStyles = 'w-full text-sm text-left rtl:text-right'
    const variantStyles = {
      simple: '',
      striped: '[&_tbody_tr:nth-child(odd)]:bg-gray-50',
    }

    return (
      <div className="relative overflow-x-auto">
        <table
          ref={ref}
          className={`${baseStyles} ${variantStyles[variant]} ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    )
  }
)

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = '', children, ...props }, ref) => (
    <thead
      ref={ref}
      className={`text-xs uppercase bg-gray-50 text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </thead>
  )
)

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = '', children, ...props }, ref) => (
    <tbody ref={ref} className={`${className}`} {...props}>
      {children}
    </tbody>
  )
)

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = '', children, ...props }, ref) => (
    <tr
      ref={ref}
      className={`border-b hover:bg-gray-50 ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
)

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', children, ...props }, ref) => (
    <td ref={ref} className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </td>
  )
)

const TableHeaderCell = React.forwardRef<
  HTMLTableHeaderCellElement,
  TableHeaderCellProps
>(({ className = '', children, ...props }, ref) => (
  <th ref={ref} className={`px-6 py-3 ${className}`} {...props}>
    {children}
  </th>
))

Table.displayName = 'Table'
TableHeader.displayName = 'TableHeader'
TableBody.displayName = 'TableBody'
TableRow.displayName = 'TableRow'
TableCell.displayName = 'TableCell'
TableHeaderCell.displayName = 'TableHeaderCell'

export { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell }
