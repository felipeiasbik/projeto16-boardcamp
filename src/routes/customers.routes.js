import { Router } from "express";
import { getCustomers, getIdCustomer, postCustomer, putCustomer } from "../controllers/customers.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { customersSchema } from "../schemas/customersSchema.js"

const customersRouter = Router();

customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id", getIdCustomer);
customersRouter.post("/customers", validateSchema(customersSchema), postCustomer);
customersRouter.put("/customers/:id", validateSchema(customersSchema), putCustomer);

export default customersRouter;