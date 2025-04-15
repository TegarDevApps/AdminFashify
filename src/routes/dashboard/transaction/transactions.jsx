import { useEffect, useState } from "react";
import { db } from "../../db/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { PencilLine, Trash } from "lucide-react";

const DashboardTransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "transactions"));
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTransactions(data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };
        fetchTransactions();
    }, []);

    const handleEdit = (transaction) => {
        setSelectedTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (transaction) => {
        await deleteDoc(doc(db, "transactions", transaction.id));
        setTransactions(transactions.filter(item => item.id !== transaction.id));
    };

    const updateTransaction = async () => {
        if (!selectedTransaction) return;
        const transRef = doc(db, "transactions", selectedTransaction.id);
        await updateDoc(transRef, selectedTransaction);
        setIsEditModalOpen(false);
        setTransactions(transactions.map(item => item.id === selectedTransaction.id ? selectedTransaction : item));
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <div className="overflow-x-auto card text-white">
                <table className="min-w-full ">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Order ID</th>
                            <th>Payment Type</th>
                            <th>Customer Name</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, index) => (
                            <tr key={tx.id}>
                                <td>{index + 1}</td>
                                <td>{tx.orderId}</td>
                                <td>{tx.payment_type}</td>
                                <td>{tx.customerDetails?.name}</td>
                                <td>{tx.status}</td>
                                <td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.totalAmount || 0)}</td>
                                <td>
                                    <button className="text-blue-500" onClick={() => handleEdit(tx)}><PencilLine size={20} /></button>
                                    <button className="text-red-500 ml-2" onClick={() => handleDelete(tx)}><Trash size={20} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isEditModalOpen && selectedTransaction && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Edit Transaction</h2>

                        <label className="block text-sm font-medium">Customer Name</label>
                        <input
                            type="text"
                            value={selectedTransaction.customerDetails?.name || ""}
                            onChange={(e) => setSelectedTransaction({
                                ...selectedTransaction,
                                customerDetails: { ...selectedTransaction.customerDetails, name: e.target.value }
                            })}
                            className="w-full border p-2 rounded mb-2"
                        />

                        <label className="block text-sm font-medium">Status</label>
                        <input
                            type="text"
                            value={selectedTransaction.status || ""}
                            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, status: e.target.value })}
                            className="w-full border p-2 rounded mb-2"
                        />

                        <label className="block text-sm font-medium">Total Amount</label>
                        <input
                            type="number"
                            value={selectedTransaction.totalAmount || 0}
                            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, totalAmount: Number(e.target.value) })}
                            className="w-full border p-2 rounded mb-2"
                        />

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={updateTransaction}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="bg-gray-300 px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardTransactionsPage;
