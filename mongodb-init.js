// MongoDB initialization script
db = db.getSiblingDB('evote');

// Create collections with validation
db.createCollection('elections', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'status'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200
        },
        description: {
          bsonType: 'string',
          maxLength: 1000
        },
        status: {
          enum: ['draft', 'running', 'closed']
        },
        candidates: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['id', 'name'],
            properties: {
              id: { bsonType: 'string' },
              name: { bsonType: 'string' }
            }
          }
        }
      }
    }
  }
});

db.createCollection('voters', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['voterId', 'eligible'],
      properties: {
        voterId: {
          bsonType: 'string',
          minLength: 1
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        phone: {
          bsonType: 'string',
          pattern: '^\\d{10,15}$'
        },
        eligible: {
          bsonType: 'bool'
        }
      }
    }
  }
});

db.createCollection('votes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['electionId', 'candidateId'],
      properties: {
        electionId: {
          bsonType: 'objectId'
        },
        candidateId: {
          bsonType: 'string'
        },
        ballotHash: {
          bsonType: 'string'
        }
      }
    }
  }
});

db.createCollection('tokens', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['electionId', 'voterRef', 'token', 'used'],
      properties: {
        electionId: {
          bsonType: 'objectId'
        },
        voterRef: {
          bsonType: 'string'
        },
        token: {
          bsonType: 'string'
        },
        used: {
          bsonType: 'bool'
        }
      }
    }
  }
});

db.createCollection('admins', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'passwordHash'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        passwordHash: {
          bsonType: 'string'
        },
        roles: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        }
      }
    }
  }
});

db.createCollection('auditlogs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['actorType', 'action', 'timestamp'],
      properties: {
        actorType: {
          bsonType: 'string'
        },
        action: {
          bsonType: 'string'
        },
        timestamp: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for better performance
db.elections.createIndex({ status: 1, startAt: 1 });
db.elections.createIndex({ status: 1, endAt: 1 });
db.elections.createIndex({ resultsPublished: 1, status: 1 });

db.voters.createIndex({ voterId: 1 }, { unique: true });
db.voters.createIndex({ email: 1 }, { sparse: true });
db.voters.createIndex({ phone: 1 }, { sparse: true });
db.voters.createIndex({ assignedElections: 1, eligible: 1 });

db.votes.createIndex({ electionId: 1, candidateId: 1 });
db.votes.createIndex({ electionId: 1, castAt: 1 });

db.tokens.createIndex({ token: 1, electionId: 1 }, { unique: true });
db.tokens.createIndex({ electionId: 1, voterRef: 1, used: 1 });

db.admins.createIndex({ email: 1 }, { unique: true });

db.auditlogs.createIndex({ timestamp: -1 });
db.auditlogs.createIndex({ actorType: 1, timestamp: -1 });

print('Database initialization completed successfully!');





