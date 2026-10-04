export const removeFromCart = async (req, res) => {
    try {
      const { productId } = req.params;
  
      const cart = await Cart.findOne({ user: req.user._id });
  
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      cart.items = cart.items.filter(
        (i) => i.product.toString() !== productId
      );
  
      await cart.save();
  
      return res.status(200).json(cart);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };