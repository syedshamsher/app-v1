import { useEffect, useState } from "react";
import { DataTable } from "common";
import axios from "axios";
import { Country } from "./types";
import "./index.css";
import { findMaxKeysElement } from "../helper";

type SortConfig = {
  key: string;
  direction: "ascending" | "descending";
};

export function Features() {
  const [data, setData] = useState<Country[]>([]);
  const [filteredData, setFilteredData] = useState<Country[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortableColumns, setSortableColumns] = useState<string[]>([
    "name",
    "population",
    "area",
    "capital",
    "region",
  ]);
  const [filterableColumns, setFilterableColumns] = useState<string[]>([
    "name",
    "region",
  ]);
  const [entries, setEntries] = useState<number>(5);
  const [pageSize, setPageSize] = useState<number>(5);

  useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all").then((response) => {
      console.log(response?.data, "===> response");
      setData(response?.data);
    });
  }, []);

  useEffect(() => {
    let filtered = [...data];
    Object.keys(filters).forEach((key) => {
      filtered = filtered.filter((item) =>
        item[key as keyof Country]
          ?.toString()
          ?.toLowerCase()
          ?.includes(filters[key]?.toLowerCase())
      );
    });
    setFilteredData(data);
  }, [filters, data]);

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig?.key === key && sortConfig?.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const renderTableHeader = () => {
    const _data = findMaxKeysElement(data);
    return (
      <tr>
        {_data &&
          Object.keys(_data)?.map((key, index) =>
            index < entries ? (
              <th key={key}>
                <span className={"table-head"}>
                  {key}
                  {sortableColumns?.find((column) => column === key) && (
                    <button
                      onClick={() => requestSort(key)}
                      className={"sort-button"}
                    >
                      &#x25B2;
                    </button>
                  )}
                </span>
              </th>
            ) : null
          )}
      </tr>
    );
  };

  const renderTableFilters = () => {
    const _data = findMaxKeysElement(data);
    return (
      <tr>
        {_data &&
          Object.keys(_data)?.map((key, index) =>
            index < entries ? (
              <td key={key}>
                {filterableColumns?.find((column) => column === key) && (
                  <input
                    type="text"
                    value={filters[key] || ""}
                    onChange={(e) => {
                      setFilters({
                        ...filters,
                        [key]: e.target.value,
                      });
                    }}
                  />
                )}
              </td>
            ) : null
          )}
      </tr>
    );
  };
  const getSortedData = () => {
    const sortedData = [...filteredData];
    if (sortConfig !== null) {
      sortedData.sort((a, b) => {
        if (
          a[sortConfig.key as keyof Country] <
          b[sortConfig.key as keyof Country]
        ) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (
          a[sortConfig.key as keyof Country] >
          b[sortConfig.key as keyof Country]
        ) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedData;
  };

  const renderTableRows = () => {
    const sortedData = getSortedData();
    const paginatedData = sortedData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
    // Function to render object value with ellipsis
    const renderObjectValue = (value: any) => {
      const stringValue = JSON.stringify(value);
      return stringValue.length > 50
        ? `${stringValue.slice(0, 50)}...`
        : stringValue;
    };
    return paginatedData?.map((item, index) => {
      return (
        <tr key={item.name.common}>
          {Object.keys(item).map((key, index) =>
            index < entries ? (
              <td key={index} className="table-cell">
                {typeof item[key as keyof Country] === "object"
                  ? renderObjectValue(item[key as keyof Country])
                  : String(item[key as keyof Country])}
              </td>
            ) : null
          )}
        </tr>
      );
    });
  };

  const renderPagination = () => (
    <div className={"pagination"}>
      <button onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
      {Array.from({ length: Math.ceil(filteredData.length / pageSize) }).map(
        (_, index) => (
          <button key={index} onClick={() => setCurrentPage(index + 1)}>
            {index + 1}
          </button>
        )
      )}
      <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
    </div>
  );

  {
    Object.keys(data).map((value, index) => (
      <td key={index}>
        {typeof value === "object" ? JSON.stringify(value) : String(value)}
      </td>
    ));
  }

  return (
    <div className={"features"}>
      <div className={"entries-wrapper"}>
        <span>Show</span>
        <select
          className="select-entries"
          onChange={(e) => {
            setEntries(Number(e.target.value));
          }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
        <span>Entries</span>
      </div>
      <DataTable
        TableHeader={
          <>
            {renderTableHeader()}
            {renderTableFilters()}
          </>
        }
        TableBody={renderTableRows()}
        Pagination={renderPagination()}
      />
    </div>
  );
}
