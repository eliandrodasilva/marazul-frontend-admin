import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Componente genérico de Paginação
 *
 * @param {number} currentPage - Página atual (1-indexada)
 * @param {number} totalPages - Total de páginas
 * @param {number} totalItems - Total de itens filtrados
 * @param {number} itemsPerPage - Itens por página
 * @param {function} onPageChange - Callback chamado ao alterar a página (newPage)
 * @param {string} itemName - Nome do item no singular/plural (ex: "veículo")
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  itemName = "registro",
  itemNamePlural,
}) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Gera lista de páginas com ellipsis inteligente
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-3 border-t px-6 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      {/* Informação de contagem */}
      <p className="text-xs text-muted-foreground">
        Exibindo{" "}
        <span className="font-semibold text-foreground">
          {startItem}–{endItem}
        </span>{" "}
        de <span className="font-semibold text-foreground">{totalItems}</span>{" "}
        {totalItems === 1 ? itemName : itemNamePlural || `${itemName}s`}
      </p>

      {/* Controles de paginação */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Botão Anterior */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Página anterior"
            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* Números das páginas */}
          <div className="mx-1 flex items-center gap-1">
            {pageNumbers.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-8 w-8 select-none items-center justify-center text-xs text-muted-foreground"
                  >
                    ...
                  </span>
                );
              }

              const isActive = currentPage === page;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`flex h-8 min-w-[32px] cursor-pointer items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Botão Próximo */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Próxima página"
            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground"
          >
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
