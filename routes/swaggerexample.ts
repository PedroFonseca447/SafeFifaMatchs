router.patch('/users/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    // monta só o que veio no body (não undefined)
    const data: Record<string, any> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (age !== undefined) data.age = age;

    // se não veio nada pra atualizar
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
});
 put para partida