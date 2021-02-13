import React from "react";

import { useEffect, useState } from "react";
import SteinStore from "stein-js-client";
import {
  parseIDR,
  parseDate,
  parseTime,
  formatStartCase,
  sortArrOfObjByString,
  sortArrOfObjByNumber,
  generateUUID,
} from "../../utils";
import JsonToForm from "json-reactform";
import { Table, Button } from "../../components";
import Modal from "react-modal";
import ReactPaginate from "react-paginate";
import styles from "./styles/HomepageContent.module.scss";
import classNames from "classnames";
import toast, { Toaster } from "react-hot-toast";

const DATA_PER_PAGE = 20;

const sortForm = {
  Urutkan: {
    type: "select",
    options: [
      { label: "Komoditas (A-Z)", value: "komoditasAscending" },
      { label: "Komoditas (Z-A)", value: "komoditasDescending" },
      { label: "Provinsi (A-Z)", value: "provinsiAscending" },
      { label: "Provinsi (Z-A)", value: "provinsiDescending" },
      { label: "Ukuran terberat", value: "sizeBiggest" },
      { label: "Ukuran teringan", value: "sizeSmallest" },
      { label: "Harga terendah", value: "priceLow" },
      { label: "Harga tertinggi", value: "priceHigh" },
    ],
    placeholder: "Urutkan berdasarkan...",
  },
};

export default function HomepageContent() {
  const [isModalOpen, setModal] = useState(false);
  const [data, setData] = useState(null);
  const [modifiedData, setModifiedData] = useState([]);
  const [visibleData, setVisibleData] = useState([]);
  const [enumArea, setEnumArea] = useState([]);
  const [enumProvinsi, setEnumProvinsi] = useState([]);
  const [enumKota, setEnumKota] = useState([]);
  const [enumSize, setEnumSize] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currPage, setCurrPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const store = new SteinStore(
    "https://stein.efishery.com/v1/storages/5e1edf521073e315924ceab4"
  );

  const filterForm = {
    Komoditas: {
      type: "text",
    },
    Ukuran: {
      type: "select",
      placeholder: "Pilih ukuran",
      options: enumSize,
    },
    Provinsi: {
      type: "select",
      placeholder: "Pilih provinsi",
      options: enumProvinsi,
    },
    Kota: {
      type: "select",
      placeholder: "Pilih kota",
      disabled: enumKota.length === 0,
      options: enumKota,
    },
    Filter: {
      type: "submit",
    },
  };

  const addForm = {
    Komoditas: {
      type: "text",
      required: true,
    },
    Ukuran: {
      type: "select",
      placeholder: "Pilih ukuran",
      required: true,
      options: enumSize,
    },
    Provinsi: {
      type: "select",
      placeholder: "Pilih provinsi",
      required: true,
      options: enumProvinsi,
    },
    Kota: {
      type: "select",
      placeholder: "Pilih kota",
      required: true,
      options: enumKota,
    },
    Harga: {
      type: "number",
      required: true,
    },
    Tambah: {
      type: "submit",
    },
  };

  useEffect(() => {
    let optionsSize = [],
      cleanData = [];
    store
      .read("list")
      .then((res) => {
        res.forEach((item) => {
          if (item.tgl_parsed) {
            cleanData.push(item);
          }
        });
        setData(cleanData);
        setModifiedData(cleanData);
        setVisibleData(cleanData.slice(0, DATA_PER_PAGE));
        setTotalPage(Math.ceil(cleanData.length / DATA_PER_PAGE));
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Gagal memuat data");
      });

    store
      .read("option_area")
      .then((res) => {
        setEnumArea(res);
      })
      .catch(() => {
        toast.error("Gagal memuat data");
      });

    store
      .read("option_size")
      .then((res) => {
        res.forEach((item) => {
          optionsSize.push({ label: item.size, value: item.size });
        });
        setEnumSize(optionsSize);
      })
      .catch(() => {
        toast.error("Gagal memuat data");
      });
  }, []);

  useEffect(() => {
    filterForm.Ukuran["options"] = enumSize;
    addForm.Ukuran["options"] = enumSize;
    console.log("filterForm", filterForm);
  }, [enumSize]);

  useEffect(() => {
    let provinsi = [];
    let kota = [];
    /**
     * Note:
     * tadinya mau dibuat agar options untuk kota nya
     * menyesuaikan dari input provinsi,
     * tapi nampaknya Select component
     * dari json-reactform
     * tidak support async options ya
     * (stuck di spinner walaupun sudah lewat state)
     */
    enumArea.forEach((item) => {
      provinsi.push({
        label: formatStartCase(item.province),
        value: item.province,
      });
      kota.push({
        label: formatStartCase(item.city),
        value: item.city,
      });
    });
    setEnumProvinsi(provinsi);
    setEnumKota(kota);
  }, [enumArea]);

  useEffect(() => {
    setCurrPage(0);
    setVisibleData([...modifiedData].slice(0, DATA_PER_PAGE));
    setTotalPage(Math.ceil(modifiedData.length / DATA_PER_PAGE));
  }, [modifiedData]);

  const handleFilter = (val) => {
    setIsLoading(true);
    let filteredData = data;
    if (val.Komoditas !== "") {
      filteredData = filteredData.filter((item) => {
        return (
          item &&
          item.komoditas &&
          item.komoditas.toLowerCase().indexOf(val.Komoditas.toLowerCase()) !==
            -1
        );
      });
    }

    if (val.Ukuran !== "") {
      filteredData = filteredData.filter(
        (item) => item.size === val.Ukuran.value
      );
    }

    if (val.Provinsi !== "") {
      filteredData = filteredData.filter(
        (item) => item.area_provinsi === val.Provinsi.value
      );
    }

    if (val.Kota !== "") {
      filteredData = filteredData.filter(
        (item) => item.area_kota === val.Kota.value
      );
    }

    setModifiedData([...filteredData]);
    setIsLoading(false);
  };

  const handleAdd = (val) => {
    const uuid = generateUUID();
    store
      .append("list", [
        {
          uuid: uuid,
          komoditas: val.Komoditas,
          area_provinsi: val.Provinsi.value,
          area_kota: val.Kota.value,
          size: val.Ukuran.value,
          price: val.Harga,
          tgl_parsed: String(new Date().toISOString()),
          timestamp: Date.now(),
        },
      ])
      .then(() => {
        toast.success("Data berhasil ditambahkan.");
        setTimeout(window.location.reload(), 1000);
      })
      .catch((err) => {
        toast.error(err);
      });
  };

  /** See comment on line 166 */
  // const handleFilterChange = (e) => {
  //   console.log("e:", e);
  //   if (e.changed[0] === "Provinsi") {
  //     const chosenProvinceVal = e.value.Provinsi.value;
  //     const objOfProvince = enumArea.find(
  //       (e) => e["province"] === chosenProvinceVal
  //     );
  //     setEnumKota([
  //       {
  //         label: formatStartCase(objOfProvince.city),
  //         value: objOfProvince.city,
  //       },
  //     ]);
  //   }
  // };/

  const handleSortChange = (e) => {
    const chosenSort = e.value.Urutkan.value;
    let sortedData;
    if (chosenSort === "provinsiAscending") {
      sortedData = sortArrOfObjByString(modifiedData, "area_provinsi");
    } else if (chosenSort === "provinsiDescending") {
      sortedData = sortArrOfObjByString(
        modifiedData,
        "area_provinsi"
      ).reverse();
    } else if (chosenSort === "sizeBiggest") {
      sortedData = sortArrOfObjByNumber(modifiedData, "size").reverse();
    } else if (chosenSort === "sizeSmallest") {
      sortedData = sortArrOfObjByNumber(modifiedData, "size");
    } else if (chosenSort === "komoditasAscending") {
      sortedData = sortArrOfObjByString(modifiedData, "komoditas");
    } else if (chosenSort === "komoditasDescending") {
      sortedData = sortArrOfObjByString(modifiedData, "komoditas").reverse();
    } else if (chosenSort === "priceHigh") {
      sortedData = sortArrOfObjByNumber(modifiedData, "price").reverse();
    } else if (chosenSort === "priceLow") {
      sortedData = sortArrOfObjByNumber(modifiedData, "price");
    } else {
      sortedData = modifiedData;
    }
    setModifiedData([...sortedData]);
  };

  const openAddModal = () => {
    setModal(true);
  };

  const closeAddModal = () => {
    setModal(false);
  };

  const handleChangePagination = (e) => {
    const offset = e.selected * DATA_PER_PAGE;
    const currDataShown = modifiedData.slice(offset, offset + DATA_PER_PAGE);
    setCurrPage(e.selected);
    setVisibleData([...currDataShown]);
  };

  return (
    <>
      <header className={styles.mainHeading}>
        <div className={styles.container}>
          <h1>Harga Perikanan di Indonesia</h1>
        </div>
      </header>
      <main className={styles.container}>
        <div className={styles.content}>
          {enumArea.length > 0 &&
            enumProvinsi.length > 0 &&
            enumSize.length > 0 && (
              <div className={styles.filterContainer}>
                <h4>Filter berdasarkan:</h4>
                <JsonToForm
                  model={filterForm}
                  onSubmit={handleFilter}
                  // onChange={handleFilterChange}
                />
                <JsonToForm model={sortForm} onChange={handleSortChange} />
              </div>
            )}
          {isLoading ? (
            <div className={styles.textCenter}>Mohon menunggu...</div>
          ) : (
            <>
              <div className={styles.addButtonContainer}>
                <Button onClick={openAddModal}>Tambah Data</Button>
              </div>
              <Table>
                <thead>
                  <tr>
                    <th>Komoditas</th>
                    <th>Provinsi</th>
                    <th>Kota</th>
                    <th>Ukuran</th>
                    <th>Harga</th>
                    <th colSpan="2" className={styles.hideCellOnMobile}>
                      Terakhir diubah
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleData.length > 0 ? (
                    visibleData.map((item, id) => {
                      return (
                        <tr key={id}>
                          <td>
                            {item.komoditas ? (
                              item.komoditas
                            ) : (
                              <span className={styles.notFound}>
                                Data tidak ditemukan
                              </span>
                            )}
                          </td>
                          <td>
                            {item["area_provinsi"] ? (
                              formatStartCase(item["area_provinsi"])
                            ) : (
                              <span className={styles.notFound}>
                                Data tidak ditemukan
                              </span>
                            )}
                          </td>
                          <td>
                            {item["area_kota"] ? (
                              formatStartCase(item["area_kota"])
                            ) : (
                              <span className={styles.notFound}>
                                Data tidak ditemukan
                              </span>
                            )}
                          </td>
                          <td className={styles.numeric}>
                            {item.size ? (
                              item.size + "kg"
                            ) : (
                              <span className={styles.notFound}>
                                Data tidak ditemukan
                              </span>
                            )}
                          </td>
                          <td className={styles.numeric}>
                            {item.price ? (
                              parseIDR(item.price)
                            ) : (
                              <span className={styles.notFound}>
                                Data tidak ditemukan
                              </span>
                            )}
                          </td>
                          <td
                            className={classNames(
                              styles.textRight,
                              styles.hideCellOnMobile
                            )}
                          >
                            {item.tgl_parsed ? (
                              parseDate(item.tgl_parsed)
                            ) : (
                              <span className={styles.notFound}>
                                Data tidak ditemukan
                              </span>
                            )}
                          </td>
                          <td className={styles.hideCellOnMobile}>
                            {item.timestamp ? (
                              parseTime(item.timestamp)
                            ) : (
                              <span className={styles.notFound}>
                                Data tidak ditemukan
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className={styles.textCenter}>
                        Data tidak ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <ReactPaginate
                pageCount={totalPage}
                onPageChange={handleChangePagination}
                forcePage={currPage}
                marginPagesDisplayed={1}
                pageRangeDisplayed={1}
                containerClassName={styles.pagination}
                activeClassName={styles.paginationActive}
                previousLabel={"Sebelumnya"}
                nextLabel={"Berikutnya"}
              />
            </>
          )}
        </div>
      </main>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeAddModal}
        preventScroll={true}
        style={{
          content: {
            height: "fit-content",
          },
        }}
        ariaHideApp={false}
      >
        <h4 className={styles.modalTitle}>Tambah Data</h4>
        <JsonToForm model={addForm} onSubmit={handleAdd} />
      </Modal>
      <Toaster />
    </>
  );
}
