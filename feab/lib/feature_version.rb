require 'byebug'

class FeatureVersion < Gem::Version
  MAJOR = :major
  MINOR = :minor
  PATCH = :patch

  PART_IDX = [MAJOR, MINOR, PATCH]

  def parts
    @parts ||= self.to_s.split('.').map(&:to_i)
  end
  
  def [](idx)
    parts[idx]
  end
  
  def major
    self[0]
  end

  def minor
    self[1]
  end

  def patch
    self[2]
  end

  def bump_part(part_sym)
    part_idx = PART_IDX.index(part_sym)
    new_parts = parts.dup
    new_parts[part_idx] = new_parts[part_idx] + 1
    
    self.class.create(new_parts.join('.'))
  end
  
end
