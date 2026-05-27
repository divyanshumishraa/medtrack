"use client";

import axios from "axios";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import toast, {
  Toaster,
} from "react-hot-toast";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import {
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  Trash2,
  Search,
  Pencil,
  Moon,
  Sun,
  Download,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

interface Device {
  id?: number;
  name: string;
  quantity: number;
  status: string;
}

export default function Home() {
  const router = useRouter();

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [activeTab, setActiveTab] =
    useState("dashboard");

  const [search, setSearch] =
    useState("");

  const [darkMode, setDarkMode] =
    useState(false);

  const [role, setRole] =
    useState("admin");

  const [editingDevice, setEditingDevice] =
    useState<Device | null>(null);

  const [form, setForm] =
    useState<Device>({
      name: "",
      quantity: 0,
      status: "Available",
    });

  // FETCH DEVICES

  const fetchDevices = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/devices",
        {
          headers: {
            authorization:
              localStorage.getItem(
                "token"
              ),
          },
        }
      );

      setDevices(res.data);
    } catch {
      toast.error(
        "Failed to fetch devices"
      );
    }
  };

  // AUTH

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const savedRole =
      localStorage.getItem("role");

    if (!token) {
      router.push("/login");
      return;
    }

    if (savedRole) {
      setRole(savedRole);
    }

    fetchDevices();
  }, []);

  // ADD DEVICE

  const addDevice = async () => {
    if (!form.name) {
      toast.error("Fill fields");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/devices",
        form,
        {
          headers: {
            authorization:
              localStorage.getItem(
                "token"
              ),
          },
        }
      );

      toast.success("Device Added");

      setForm({
        name: "",
        quantity: 0,
        status: "Available",
      });

      fetchDevices();
    } catch {
      toast.error(
        "Failed to add device"
      );
    }
  };

  // DELETE

  const deleteDevice = async (
    id: number
  ) => {
    try {
      await axios.delete(
        `http://localhost:8080/devices/${id}`,
        {
          headers: {
            authorization:
              localStorage.getItem(
                "token"
              ),
          },
        }
      );

      toast.success(
        "Device Deleted"
      );

      fetchDevices();
    } catch {
      toast.error("Delete failed");
    }
  };

  // UPDATE

  const updateDevice = async () => {
    if (!editingDevice) return;

    try {
      await axios.put(
        `http://localhost:8080/devices/${editingDevice.id}`,
        editingDevice,
        {
          headers: {
            authorization:
              localStorage.getItem(
                "token"
              ),
          },
        }
      );

      toast.success(
        "Device Updated"
      );

      setEditingDevice(null);

      fetchDevices();
    } catch {
      toast.error("Update failed");
    }
  };

  // SEARCH

  const filteredDevices =
    devices.filter((device) =>
      device.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // CSV EXPORT

  const exportCSV = () => {
    const headers =
      "Name,Quantity,Status\n";

    const rows = devices
      .map(
        (d) =>
          `${d.name},${d.quantity},${d.status}`
      )
      .join("\n");

    const blob = new Blob(
      [headers + rows],
      {
        type: "text/csv",
      }
    );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "devices-report.csv";

    a.click();

    toast.success(
      "CSV Exported"
    );
  };

  // PDF EXPORT

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text(
      "MedTrack Device Report",
      14,
      15
    );

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Device",
          "Quantity",
          "Status",
        ],
      ],
      body: devices.map((d) => [
        d.name,
        d.quantity,
        d.status,
      ]),
    });

    doc.save(
      "medtrack-report.pdf"
    );

    toast.success(
      "PDF Exported"
    );
  };

  // ANALYTICS

  const statusData = [
    {
      name: "Available",
      value: devices.filter(
        (d) =>
          d.status ===
          "Available"
      ).length,
    },
    {
      name: "In Use",
      value: devices.filter(
        (d) =>
          d.status === "In Use"
      ).length,
    },
    {
      name: "Maintenance",
      value: devices.filter(
        (d) =>
          d.status ===
          "Maintenance"
      ).length,
    },
  ];

  const monthlyData = [
    {
      month: "Jan",
      devices: 20,
    },
    {
      month: "Feb",
      devices: 35,
    },
    {
      month: "Mar",
      devices: 28,
    },
    {
      month: "Apr",
      devices: 45,
    },
    {
      month: "May",
      devices: 52,
    },
  ];

  const COLORS = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
  ];

  return (
    <main
      className={`flex min-h-screen ${darkMode
          ? "bg-black text-white"
          : "bg-gray-100 text-black"
        }`}
    >
      <Toaster position="top-right" />

      {/* SIDEBAR */}

      <aside className="w-72 bg-black text-white p-6">
        <h1 className="text-4xl font-bold mb-10">
          MedTrack
        </h1>

        <nav className="space-y-4">
          <button
            onClick={() =>
              setActiveTab(
                "dashboard"
              )
            }
            className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-gray-800"
          >
            <LayoutDashboard />
            Dashboard
          </button>

          <button
            onClick={() =>
              setActiveTab(
                "inventory"
              )
            }
            className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-gray-800"
          >
            <Package />
            Inventory
          </button>

          <button
            onClick={() =>
              setActiveTab(
                "analytics"
              )
            }
            className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-gray-800"
          >
            <BarChart3 />
            Analytics
          </button>

          <button
            onClick={() =>
              setActiveTab(
                "settings"
              )
            }
            className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-gray-800"
          >
            <Settings />
            Settings
          </button>
        </nav>

        {/* DARK MODE */}

        <button
          onClick={() =>
            setDarkMode(
              !darkMode
            )
          }
          className="flex items-center gap-3 mt-10 bg-gray-800 p-4 rounded-xl w-full"
        >
          {darkMode ? (
            <Sun />
          ) : (
            <Moon />
          )}

          {darkMode
            ? "Light Mode"
            : "Dark Mode"}
        </button>

        {/* LOGOUT */}

        <button
          onClick={() => {
            localStorage.removeItem(
              "token"
            );

            router.push(
              "/login"
            );
          }}
          className="w-full bg-red-500 py-3 rounded-xl mt-6"
        >
          Logout
        </button>
      </aside>

      {/* CONTENT */}

      <section className="flex-1 p-8">
        {/* DASHBOARD */}

        {activeTab ===
          "dashboard" && (
            <>
              <h1 className="text-5xl font-bold mb-8">
                Dashboard
              </h1>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white text-black p-8 rounded-2xl">
                  <h2 className="text-2xl">
                    Total Devices
                  </h2>

                  <p className="text-5xl font-bold mt-4">
                    {
                      devices.length
                    }
                  </p>
                </div>

                <div className="bg-white text-black p-8 rounded-2xl">
                  <h2 className="text-2xl">
                    Low Stock
                  </h2>

                  <p className="text-5xl font-bold mt-4 text-red-500">
                    {
                      devices.filter(
                        (
                          d
                        ) =>
                          d.quantity <
                          5
                      ).length
                    }
                  </p>
                </div>

                <div className="bg-white text-black p-8 rounded-2xl">
                  <h2 className="text-2xl">
                    Available
                  </h2>

                  <p className="text-5xl font-bold mt-4 text-green-500">
                    {
                      devices.filter(
                        (
                          d
                        ) =>
                          d.status ===
                          "Available"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </>
          )}

        {/* INVENTORY */}

        {activeTab ===
          "inventory" && (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-5xl font-bold">
                    Inventory
                  </h1>

                  <p className="text-xl mt-2 text-gray-500">
                    Manage hospital
                    devices
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={
                      exportCSV
                    }
                    className="bg-green-500 text-white px-6 py-3 rounded-xl flex items-center gap-2"
                  >
                    <Download />
                    CSV
                  </button>

                  <button
                    onClick={
                      exportPDF
                    }
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2"
                  >
                    <Download />
                    PDF
                  </button>
                </div>
              </div>

              {/* SEARCH */}

              <div className="bg-white text-black p-5 rounded-2xl flex items-center gap-3 mb-8">
                <Search />

                <input
                  type="text"
                  placeholder="Search devices..."
                  value={search}
                  onChange={(
                    e
                  ) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="w-full outline-none text-xl"
                />
              </div>

              {/* ROLE */}

              <div className="mb-6">
                <span className="bg-black text-white px-4 py-2 rounded-xl">
                  Logged in as:
                  {" "}
                  {role}
                </span>
              </div>

              {/* ADD DEVICE */}

              {role ===
                "admin" && (
                  <div className="bg-white text-black p-8 rounded-2xl mb-8">
                    <h2 className="text-4xl font-bold mb-8">
                      Add Device
                    </h2>

                    <div className="grid md:grid-cols-3 gap-5">
                      <input
                        type="text"
                        placeholder="Device Name"
                        value={
                          form.name
                        }
                        onChange={(
                          e
                        ) =>
                          setForm({
                            ...form,
                            name: e
                              .target
                              .value,
                          })
                        }
                        className="border p-5 rounded-xl"
                      />

                      <input
                        type="number"
                        placeholder="Quantity"
                        value={
                          form.quantity
                        }
                        onChange={(
                          e
                        ) =>
                          setForm({
                            ...form,
                            quantity:
                              Number(
                                e
                                  .target
                                  .value
                              ),
                          })
                        }
                        className="border p-5 rounded-xl"
                      />

                      <select
                        value={
                          form.status
                        }
                        onChange={(
                          e
                        ) =>
                          setForm({
                            ...form,
                            status:
                              e
                                .target
                                .value,
                          })
                        }
                        className="border p-5 rounded-xl"
                      >
                        <option>
                          Available
                        </option>

                        <option>
                          In Use
                        </option>

                        <option>
                          Maintenance
                        </option>
                      </select>
                    </div>

                    <button
                      onClick={
                        addDevice
                      }
                      className="mt-6 bg-black text-white px-8 py-4 rounded-xl"
                    >
                      Add Device
                    </button>
                  </div>
                )}

              {/* TABLE */}

              <div className="bg-white text-black p-8 rounded-2xl overflow-x-auto">
                <h2 className="text-4xl font-bold mb-8">
                  Device
                  Inventory
                </h2>

                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-4">
                        Device
                      </th>

                      <th className="p-4">
                        Quantity
                      </th>

                      <th className="p-4">
                        Status
                      </th>

                      {role ===
                        "admin" && (
                          <th className="p-4">
                            Actions
                          </th>
                        )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDevices.map(
                      (
                        device
                      ) => (
                        <tr
                          key={
                            device.id
                          }
                          className="border-b"
                        >
                          <td className="p-4">
                            {
                              device.name
                            }
                          </td>

                          <td className="p-4">
                            {
                              device.quantity
                            }
                          </td>

                          <td className="p-4">
                            {
                              device.status
                            }
                          </td>

                          {role ===
                            "admin" && (
                              <td className="p-4 flex gap-4">
                                <button
                                  onClick={() =>
                                    setEditingDevice(
                                      device
                                    )
                                  }
                                  className="text-blue-500"
                                >
                                  <Pencil />
                                </button>

                                <button
                                  onClick={() =>
                                    deleteDevice(
                                      device.id!
                                    )
                                  }
                                  className="text-red-500"
                                >
                                  <Trash2 />
                                </button>
                              </td>
                            )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

        {/* ANALYTICS */}

        {activeTab ===
          "analytics" && (
            <>
              <h1 className="text-5xl font-bold mb-8">
                Analytics
              </h1>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* PIE */}

                <div className="bg-white text-black p-8 rounded-2xl">
                  <h2 className="text-3xl font-bold mb-6">
                    Device Status
                  </h2>

                  <div className="h-96">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={
                            statusData
                          }
                          dataKey="value"
                          outerRadius={
                            120
                          }
                          label
                        >
                          {statusData.map(
                            (
                              entry,
                              index
                            ) => (
                              <Cell
                                key={
                                  index
                                }
                                fill={
                                  COLORS[
                                  index %
                                  COLORS.length
                                  ]
                                }
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* LINE CHART */}

                <div className="bg-white text-black p-8 rounded-2xl">
                  <h2 className="text-3xl font-bold mb-6">
                    Monthly Usage
                  </h2>

                  <div className="h-96">
                    <ResponsiveContainer>
                      <LineChart
                        data={
                          monthlyData
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="month" />

                        <YAxis />

                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="devices"
                          stroke="#2563eb"
                          strokeWidth={
                            3
                          }
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

        {/* SETTINGS */}

        {activeTab ===
          "settings" && (
            <>
              <h1 className="text-5xl font-bold mb-8">
                Settings
              </h1>

              <div className="bg-white text-black p-8 rounded-2xl">
                <h2 className="text-3xl font-bold mb-4">
                  Role Access
                </h2>

                <select
                  value={role}
                  onChange={(e) => {
                    setRole(
                      e.target.value
                    );

                    localStorage.setItem(
                      "role",
                      e.target.value
                    );
                  }}
                  className="border p-4 rounded-xl text-xl"
                >
                  <option value="admin">
                    Admin
                  </option>

                  <option value="staff">
                    Staff
                  </option>
                </select>

                <p className="mt-6 text-gray-500">
                  Staff can only
                  view devices.
                  Admin can manage
                  everything.
                </p>
              </div>
            </>
          )}
      </section>

      {/* EDIT MODAL */}

      {editingDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white text-black p-10 rounded-2xl w-[500px]">
            <h2 className="text-4xl font-bold mb-8">
              Edit Device
            </h2>

            <div className="space-y-5">
              <input
                type="text"
                value={
                  editingDevice.name
                }
                onChange={(e) =>
                  setEditingDevice({
                    ...editingDevice,
                    name: e.target.value,
                  })
                }
                className="w-full border p-4 rounded-xl"
              />

              <input
                type="number"
                value={
                  editingDevice.quantity
                }
                onChange={(e) =>
                  setEditingDevice({
                    ...editingDevice,
                    quantity:
                      Number(
                        e.target.value
                      ),
                  })
                }
                className="w-full border p-4 rounded-xl"
              />

              <select
                value={
                  editingDevice.status
                }
                onChange={(e) =>
                  setEditingDevice({
                    ...editingDevice,
                    status:
                      e.target.value,
                  })
                }
                className="w-full border p-4 rounded-xl"
              >
                <option>
                  Available
                </option>

                <option>
                  In Use
                </option>

                <option>
                  Maintenance
                </option>
              </select>

              <div className="flex gap-4">
                <button
                  onClick={
                    updateDevice
                  }
                  className="bg-black text-white px-6 py-3 rounded-xl"
                >
                  Save
                </button>

                <button
                  onClick={() =>
                    setEditingDevice(
                      null
                    )
                  }
                  className="border px-6 py-3 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}