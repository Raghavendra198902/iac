import Joi from 'joi';

export const validateBlueprint = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    targetCloud: Joi.string().valid('azure', 'aws', 'gcp', 'on-premise', 'multi-cloud').required(),
    components: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        provider: Joi.string().required(),
        properties: Joi.object().optional(),
      })
    ).min(1).required(),
    metadata: Joi.object().optional(),
  });

  return schema.validate(data);
};

export const validateBlueprintUpdate = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    targetCloud: Joi.string().valid('azure', 'aws', 'gcp', 'on-premise', 'multi-cloud').optional(),
  }).min(1);

  return schema.validate(data);
};
