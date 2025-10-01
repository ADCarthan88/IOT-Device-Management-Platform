import { Router } from 'express';
import { DeviceController } from '../controllers/DeviceController';
import { requireRole, requirePermission } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Device:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [sensor, actuator, gateway, controller]
 *         status:
 *           type: string
 *           enum: [online, offline, maintenance, error]
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *             address:
 *               type: string
 *         metadata:
 *           type: object
 *         lastSeen:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *     DeviceData:
 *       type: object
 *       properties:
 *         deviceId:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         data:
 *           type: object
 *         dataType:
 *           type: string
 */

/**
 * @swagger
 * /api/devices:
 *   get:
 *     tags: [Devices]
 *     summary: Get all devices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [online, offline, maintenance, error]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sensor, actuator, gateway, controller]
 *     responses:
 *       200:
 *         description: List of devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     devices:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Device'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/', asyncHandler(DeviceController.getAllDevices));

/**
 * @swagger
 * /api/devices:
 *   post:
 *     tags: [Devices]
 *     summary: Create a new device
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [sensor, actuator, gateway, controller]
 *               description:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   address:
 *                     type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Device created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', requirePermission('device:create'), asyncHandler(DeviceController.createDevice));

/**
 * @swagger
 * /api/devices/{id}:
 *   get:
 *     tags: [Devices]
 *     summary: Get device by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Device'
 *       404:
 *         description: Device not found
 */
router.get('/:id', asyncHandler(DeviceController.getDeviceById));

/**
 * @swagger
 * /api/devices/{id}:
 *   put:
 *     tags: [Devices]
 *     summary: Update device
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: object
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Device updated successfully
 *       404:
 *         description: Device not found
 */
router.put('/:id', requirePermission('device:update'), asyncHandler(DeviceController.updateDevice));

/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     tags: [Devices]
 *     summary: Delete device
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *       404:
 *         description: Device not found
 */
router.delete('/:id', requirePermission('device:delete'), asyncHandler(DeviceController.deleteDevice));

/**
 * @swagger
 * /api/devices/{id}/data:
 *   get:
 *     tags: [Devices]
 *     summary: Get device data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Device data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeviceData'
 */
router.get('/:id/data', asyncHandler(DeviceController.getDeviceData));

/**
 * @swagger
 * /api/devices/{id}/data:
 *   post:
 *     tags: [Devices]
 *     summary: Add device data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *               - dataType
 *             properties:
 *               data:
 *                 type: object
 *               dataType:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Data added successfully
 *       404:
 *         description: Device not found
 */
router.post('/:id/data', requirePermission('device:data:create'), asyncHandler(DeviceController.addDeviceData));

/**
 * @swagger
 * /api/devices/{id}/commands:
 *   post:
 *     tags: [Devices]
 *     summary: Send command to device
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command
 *             properties:
 *               command:
 *                 type: string
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Command sent successfully
 *       404:
 *         description: Device not found
 */
router.post('/:id/commands', requirePermission('device:command'), asyncHandler(DeviceController.sendCommand));

/**
 * @swagger
 * /api/devices/{id}/status:
 *   put:
 *     tags: [Devices]
 *     summary: Update device status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [online, offline, maintenance, error]
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Device not found
 */
router.put('/:id/status', requirePermission('device:status:update'), asyncHandler(DeviceController.updateDeviceStatus));

export default router;