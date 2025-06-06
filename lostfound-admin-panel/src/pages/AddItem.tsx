function AddItem() {
  return (
    <>
      <h2>Add New Item</h2>
      <form>
        <label>Type:</label>
        <select>
          <option>Lost</option>
          <option>Found</option>
        </select>
        <br />
        <label>Description:</label>
        <input type="text" />
        <br />
        <button type="submit">Add Item</button>
      </form>
    </>
  );
}
export default AddItem;
