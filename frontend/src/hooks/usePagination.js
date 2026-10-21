import {
    useCallback,
    useMemo,
    useState,
} from "react";

function usePagination(
    items = [],
    itemsPerPage = 10
) {
    const [
        requestedPage,
        setRequestedPage,
    ] = useState(1);

    const normalizedItems =
        Array.isArray(items)
            ? items
            : [];

    const normalizedItemsPerPage =
        Math.max(
            1,
            Number(itemsPerPage) || 10
        );

    const totalItems =
        normalizedItems.length;

    const totalPages =
        Math.ceil(
            totalItems /
            normalizedItemsPerPage
        );

    const currentPage =
        totalPages === 0
            ? 1
            : Math.min(
                Math.max(
                    requestedPage,
                    1
                ),
                totalPages
            );

    const paginatedItems =
        useMemo(() => {
            const start =
                (currentPage - 1) *
                normalizedItemsPerPage;

            return normalizedItems.slice(
                start,
                start +
                normalizedItemsPerPage
            );
        }, [
            normalizedItems,
            currentPage,
            normalizedItemsPerPage,
        ]);

    const changePage =
        useCallback(
            (page) => {
                const numericPage =
                    Number(page);

                if (
                    !Number.isFinite(
                        numericPage
                    )
                ) {
                    return;
                }

                const maximumPage =
                    Math.max(
                        totalPages,
                        1
                    );

                setRequestedPage(
                    Math.min(
                        Math.max(
                            Math.trunc(
                                numericPage
                            ),
                            1
                        ),
                        maximumPage
                    )
                );
            },
            [totalPages]
        );

    const resetPage =
        useCallback(() => {
            setRequestedPage(1);
        }, []);

    const startItem =
        totalItems === 0
            ? 0
            : (currentPage - 1) *
            normalizedItemsPerPage +
            1;

    const endItem =
        totalItems === 0
            ? 0
            : Math.min(
                currentPage *
                normalizedItemsPerPage,
                totalItems
            );

    return {
        currentPage,
        totalPages,
        totalItems,
        startItem,
        endItem,
        paginatedItems,
        setCurrentPage: changePage,
        resetPage,
        hasPreviousPage:
            currentPage > 1,
        hasNextPage:
            currentPage < totalPages,
    };
}

export default usePagination;