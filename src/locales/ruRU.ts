import { ruRU as ruRUCore } from '@mui/x-data-grid/locales';

export const ruRU = {
  components: {
    MuiDataGrid: {
      defaultProps: {
        localeText: {
          ...ruRUCore.components.MuiDataGrid.defaultProps.localeText,
          paginationRowsPerPage: 'Строк на странице:',
          paginationDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
            `${from}–${to} из ${count !== -1 ? count : `более чем ${to}`}`,
          paginationItemAriaLabel: (type: string) => {
            if (type === 'first') return 'Перейти на первую страницу';
            if (type === 'last') return 'Перейти на последнюю страницу';
            if (type === 'next') return 'Перейти на следующую страницу';
            return 'Перейти на предыдущую страницу';
          },
        },
      },
    },
  },
};