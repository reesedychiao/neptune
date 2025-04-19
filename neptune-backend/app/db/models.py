class FileSystem(Base):
    __tablename__ = 'file_system'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # 'file' or 'folder'
    parent_id = Column(Integer, ForeignKey('file_system.id'), nullable=True)

    parent = relationship("FileSystem", remote_side=[id], backref="children")


class Folder(Base):
    __tablename__ = 'folders'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)