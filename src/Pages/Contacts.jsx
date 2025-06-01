import React, { useState } from "react";
import { useTranslation } from "../Components/Context/LanguageContext";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [editIndex, setEditIndex] = useState(null);

  const { t } = useTranslation();

  const addContact = () => {
    if (!name.trim() || !email.trim()) {
      alert(t("name_email_required"));
      return;
    }
    setContacts([...contacts, { name, email, phone }]);
    resetForm();
    setShowForm(false);
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setName(contacts[index].name);
    setEmail(contacts[index].email);
    setPhone(contacts[index].phone);
    setShowForm(true);
  };

  const saveEdit = () => {
    if (!name.trim() || !email.trim()) {
      alert(t("name_email_required"));
      return;
    }
    const updatedContacts = [...contacts];
    updatedContacts[editIndex] = { name, email, phone };
    setContacts(updatedContacts);
    resetForm();
    setEditIndex(null);
    setShowForm(false);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-8 text-center tracking-tight">
          {t("contacts")}
        </h2>

        {!showForm && (
          <>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2 rounded-xl font-bold shadow transition-all duration-150 mb-6 w-full sm:w-auto"
            >
              + {t("add_contact")}
            </button>

            {contacts.length === 0 ? (
              <p className="text-blue-400 text-center mt-8">
                {t("no_contacts")}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-blue-100 shadow">
                <table className="w-full text-xs sm:text-sm min-w-[400px]">
                  <thead>
                    <tr className="bg-blue-50 text-blue-900">
                      <th className="p-2 sm:p-3 font-semibold">{t("name")}</th>
                      <th className="p-2 sm:p-3 font-semibold">{t("email")}</th>
                      <th className="p-2 sm:p-3 font-semibold">{t("phone")}</th>
                      <th className="p-2 sm:p-3 font-semibold">{t("edit")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact, idx) => (
                      <tr
                        key={idx}
                        className="bg-white border-b hover:bg-blue-50 transition"
                      >
                        <td className="p-2 sm:p-3">{contact.name}</td>
                        <td className="p-2 sm:p-3">{contact.email}</td>
                        <td className="p-2 sm:p-3">{contact.phone}</td>
                        <td className="p-2 sm:p-3">
                          <button
                            onClick={() => startEdit(idx)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-1 rounded-lg shadow transition text-xs"
                          >
                            {t("edit")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {showForm && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-6 shadow-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              {editIndex !== null ? t("edit_contact") : t("add_contact")}
            </h3>

            <label className="block mb-4">
              <span className="font-semibold text-blue-900">{t("name")}</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 font-medium placeholder-blue-400 shadow-sm"
                placeholder={t("enter_name")}
              />
            </label>

            <label className="block mb-4">
              <span className="font-semibold text-blue-900">{t("email")}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 font-medium placeholder-blue-400 shadow-sm"
                placeholder={t("enter_email")}
              />
            </label>

            <label className="block mb-6">
              <span className="font-semibold text-blue-900">{t("phone")}</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition bg-white text-blue-900 font-medium placeholder-blue-400 shadow-sm"
                placeholder={t("enter_phone")}
              />
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              {editIndex !== null ? (
                <>
                  <button
                    onClick={saveEdit}
                    className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 hover:from-blue-800 hover:to-blue-500 text-white w-full py-3 rounded-xl font-bold shadow-lg transition-all duration-150 text-base tracking-wide"
                  >
                    {t("save")}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setEditIndex(null);
                      setShowForm(false);
                    }}
                    className="bg-white border border-blue-200 text-blue-700 font-bold w-full py-3 rounded-xl shadow transition hover:bg-blue-50"
                  >
                    {t("cancel")}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={addContact}
                    className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 hover:from-blue-800 hover:to-blue-500 text-white w-full py-3 rounded-xl font-bold shadow-lg transition-all duration-150 text-base tracking-wide"
                  >
                    {t("add")}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="bg-white border border-blue-200 text-blue-700 font-bold w-full py-3 rounded-xl shadow transition hover:bg-blue-50"
                  >
                    {t("cancel")}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
