A ready-to-use table assembled from a set of consistently styled table components. In most cases, it will be sufficient for displaying any type of data. If you have some unique data that doesn’t fit into the `data` prop, you can create your own table using the provided components: `Table`, `TableBody`, `TableCell`, `TableHead`, `TableRow`.

## Usage

```jsx
import { Table } from './Table'

const data = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
]

<Table data={data} />
```

## Props

- `data` (array): Array of objects to be displayed in the table, with values of any type React can render.
- `equalColumns` (boolean, optional): Flag to make all column widths equal.
- `theadProps` (object, optional): Additional props for the table header.
- `tbodyProps` (object, optional): Additional props for the table body.
- `headerClassName` (string, optional): Additional class name for the table header.
- `renderers` (object, optional): Custom renderers for table column cells. Example:
  ```tsx
  renderers: {
    name: (value: string, row: ITable) => <p>{value} - {row.symbol}</p>
  }
  ```
- `sortingOptions` (object, optional): Custom sorting function for table columns. `false` excludes column from sorting. Example:
  ```tsx
  sortingOptions: {
    name: (a: number, b: number) => Math.sin(a) - Math.abs(b)
  }
  ```


## Best Practices

- Ensure that the data array contains objects with consistent keys to avoid rendering issues.
- Preprocess data if necessary to match the desired display format before passing it to the `Table` component.

## Limitations

- The component assumes that all data objects have the same set of keys. If the keys differ, some columns may not render correctly.

## Styling

- Use the `className` prop to apply custom styles to the table.
- The component provides a basic structure and styles. You can override or extend these styles as needed.
